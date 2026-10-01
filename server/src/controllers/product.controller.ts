import { Request, Response } from 'express';
import { store } from '../db/store.js';
import { ProductModel } from '../models/index.js';
import { AuditService } from '../services/audit.service.js';
import { ProductAlertService } from '../services/product-alert.service.js';
import { ProductStockCleanupService } from '../services/product-stock-cleanup.service.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { IProduct } from '../../src/types/index.js';

export class ProductController {
  /**
   * Helper to sanitize product for public display (NEVER expose wholesale cost or supplier info)
   */
  private static sanitizePublic(product: IProduct): Partial<IProduct> {
    const { wholesaleCost, supplierId, supplierProductCode, ...publicProduct } = product;
    return publicProduct;
  }

  /**
   * Public Product Catalog Browse / Search / Filter
   */
  public static async getPublicProducts(req: Request, res: Response): Promise<void> {
    let items = store.products.filter((p) => p.status === 'active');

    const {
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      fabric,
      color,
      size,
      featured,
      newArrival,
      sale,
      sort,
    } = req.query;

    if (category) {
      items = items.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
    }

    if (subcategory) {
      items = items.filter((p) => p.subcategory.toLowerCase() === String(subcategory).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (minPrice) {
      items = items.filter((p) => p.retailPrice >= Number(minPrice));
    }

    if (maxPrice) {
      items = items.filter((p) => p.retailPrice <= Number(maxPrice));
    }

    if (fabric) {
      items = items.filter((p) => p.fabric.toLowerCase().includes(String(fabric).toLowerCase()));
    }

    if (color) {
      items = items.filter((p) => p.color.toLowerCase().includes(String(color).toLowerCase()));
    }

    if (size) {
      items = items.filter((p) => p.sizes.includes(String(size)));
    }

    if (featured === 'true') {
      items = items.filter((p) => p.featured);
    }

    if (newArrival === 'true') {
      items = items.filter((p) => p.newArrival);
    }

    if (sale === 'true') {
      items = items.filter((p) => p.sale);
    }

    // Sorting
    switch (sort) {
      case 'price_low_high':
        items.sort((a, b) => a.retailPrice - b.retailPrice);
        break;
      case 'price_high_low':
        items.sort((a, b) => b.retailPrice - a.retailPrice);
        break;
      case 'popularity':
        items.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
        break;
      case 'newest':
      default:
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const sanitized = items.map(ProductController.sanitizePublic);
    res.json({
      total: sanitized.length,
      products: sanitized,
    });
  }

  /**
   * Public Product Detail by Slug
   */
  public static async getPublicProductBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const product = store.products.find((p) => p.slug === slug && p.status !== 'archived');

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const related = store.products
      .filter((p) => p._id !== product._id && p.category === product.category && p.status === 'active')
      .slice(0, 4)
      .map(ProductController.sanitizePublic);

    res.json({
      product: ProductController.sanitizePublic(product),
      related,
    });
  }

  /**
   * Super Admin Product Listing (Includes Wholesale and Margins)
   */
  public static async getAdminProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Passive real-time cleanup check: ensures any expired products are purged immediately
    await ProductStockCleanupService.cleanupExpiredProducts().catch(() => {});

    const productsWithMetrics = store.products.map((p) => {
      const wholesale = p.wholesaleCost || 0;
      const grossMargin = p.retailPrice - wholesale;
      const marginPercentage = p.retailPrice > 0 ? Math.round((grossMargin / p.retailPrice) * 100) : 0;
      const supplier = store.suppliers.find((s) => s._id === p.supplierId);
      return {
        ...p,
        grossMargin,
        marginPercentage,
        supplierName: supplier?.name || 'Unassigned',
      };
    });

    res.json({
      total: productsWithMetrics.length,
      products: productsWithMetrics,
    });
  }

  /**
   * Super Admin Create Product
   */
  public static async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const {
      name,
      slug: customSlug,
      sku: customSku,
      category,
      subcategory,
      brand,
      description,
      shortDescription,
      retailPrice,
      compareAtPrice,
      wholesaleCost,
      images,
      color,
      fabric,
      sizes,
      stock,
      lowStockThreshold,
      supplierId,
      supplierProductCode,
      status,
      featured,
      newArrival,
      bestSeller,
      sale,
      tags,
    } = req.body;

    if (!name || !category || !subcategory || !retailPrice || wholesaleCost === undefined) {
      res.status(400).json({ error: 'Missing mandatory product fields (name, category, subcategory, retailPrice, wholesaleCost).' });
      return;
    }

    // Auto-generate unique slug
    let baseSlug = (customSlug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (store.products.some((p) => p.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Auto-generate SKU if not provided
    const sku = customSku || `NVR-${category.slice(0, 1).toUpperCase()}${subcategory.slice(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    // Determine sizes based on subcategory (Unstitched vs Stitched)
    const isUnstitched = String(subcategory).trim().toLowerCase() === 'unstitched';
    let finalSizes: string[];
    if (isUnstitched) {
      finalSizes = ['Unstitched'];
    } else {
      finalSizes = Array.isArray(sizes) && sizes.filter((s: string) => s !== 'Unstitched').length > 0
        ? sizes.filter((s: string) => s !== 'Unstitched')
        : ['Small', 'Medium', 'Large'];
    }

    const newProduct: IProduct = {
      _id: store.generateId(),
      name: name.trim(),
      slug,
      sku,
      category,
      subcategory,
      brand: brand || store.settings?.store.brandName || 'NIVORA',
      description: description || '',
      shortDescription: shortDescription || '',
      retailPrice: Number(retailPrice),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      wholesaleCost: Number(wholesaleCost),
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'
      ],
      color: color || 'Multi',
      fabric: fabric || 'Cotton Lawn',
      sizes: finalSizes,
      stock: Number(stock ?? 10),
      lowStockThreshold: Number(lowStockThreshold ?? 2),
      stockState: Number(stock ?? 10) > 0 ? 'in_stock' : 'out_of_stock',
      stockStatus: Number(stock ?? 10) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      outOfStockAt: Number(stock ?? 10) > 0 ? null : new Date().toISOString(),
      supplierId,
      supplierProductCode,
      status: status || 'active',
      featured: Boolean(featured),
      newArrival: Boolean(newArrival),
      bestSeller: Boolean(bestSeller),
      sale: Boolean(sale),
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.products.unshift(newProduct);
    try {
      await ProductModel.updateOne({ _id: newProduct._id }, { $set: newProduct }, { upsert: true });
    } catch (dbErr) {
      console.warn('[ProductController] Direct MongoDB sync notice:', (dbErr as Error).message);
    }
    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: req.user!.role,
      action: 'PRODUCT_CREATED',
      targetType: 'PRODUCT',
      targetId: newProduct._id,
      metadata: { name: newProduct.name, sku: newProduct.sku, retailPrice: newProduct.retailPrice },
      ip: req.ip,
    });

    // Automated notification to eligible registered users (Push/Email/In-App)
    ProductAlertService.triggerNewProductLaunchAlert(newProduct).catch((err) => {
      console.warn('[ProductController] Error triggering launch alerts:', err.message);
    });

    res.status(201).json({
      message: 'Product created successfully.',
      product: newProduct,
    });
  }

  /**
   * Super Admin Update Product
   */
  public static async updateProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const product = store.products.find((p) => p._id === id);

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const updates = req.body;
    Object.assign(product, updates);
    product.updatedAt = new Date().toISOString();

    // Ensure sizes reflect Stitched vs Unstitched
    const effectiveSubcategory = String(product.subcategory || '').trim().toLowerCase();
    if (effectiveSubcategory === 'unstitched') {
      product.sizes = ['Unstitched'];
    } else if (effectiveSubcategory === 'stitched') {
      if (!product.sizes || product.sizes.length === 0 || (product.sizes.length === 1 && product.sizes[0] === 'Unstitched')) {
        product.sizes = ['Small', 'Medium', 'Large'];
      }
    }

    if (updates.stockStatus !== undefined) {
      if (updates.stockStatus === 'OUT_OF_STOCK') {
        product.stockStatus = 'OUT_OF_STOCK';
        product.outOfStockAt = product.outOfStockAt || new Date().toISOString();
        product.stockState = 'out_of_stock';
        product.stock = 0;
      } else {
        product.stockStatus = 'IN_STOCK';
        product.outOfStockAt = null;
        product.stockState = 'in_stock';
        product.stock = product.stock > 0 ? product.stock : 25;
      }
    } else if (updates.stock !== undefined) {
      product.stockState = product.stock > 0 ? 'in_stock' : 'out_of_stock';
      if (product.stock <= 0 && product.stockStatus !== 'OUT_OF_STOCK') {
        product.stockStatus = 'OUT_OF_STOCK';
        product.outOfStockAt = new Date().toISOString();
      } else if (product.stock > 0 && product.stockStatus === 'OUT_OF_STOCK') {
        product.stockStatus = 'IN_STOCK';
        product.outOfStockAt = null;
      }
    }

    store.saveToDisk();

    try {
      await ProductModel.updateOne({ _id: product._id }, { $set: product }, { upsert: true });
    } catch (dbErr) {
      console.warn('[ProductController] Direct MongoDB update notice:', (dbErr as Error).message);
    }

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: req.user!.role,
      action: 'PRODUCT_UPDATED',
      targetType: 'PRODUCT',
      targetId: product._id,
      metadata: { name: product.name, sku: product.sku },
      ip: req.ip,
    });

    res.json({
      message: 'Product updated successfully.',
      product,
    });
  }

  /**
   * Super Admin Permanent Remove Product
   */
  public static async deleteProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const index = store.products.findIndex((p) => p._id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const [removed] = store.products.splice(index, 1);
    try {
      await ProductModel.deleteOne({ _id: id });
    } catch (e) {
      console.warn('[ProductController] Direct MongoDB delete notice:', (e as Error).message);
    }
    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: req.user!.role,
      action: 'PRODUCT_DELETED',
      targetType: 'PRODUCT',
      targetId: id,
      metadata: { name: removed.name, sku: removed.sku },
      ip: req.ip,
    });

    res.json({ message: `Product "${removed.name}" has been permanently removed.` });
  }

  /**
   * Super Admin Explicitly Mark Product Stock Status (IN_STOCK or OUT_OF_STOCK)
   * PATCH /products/admin/:id/stock-status and PATCH /products/:id/stock-status
   */
  public static async setStockStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { stockStatus } = req.body;

    if (!stockStatus || (stockStatus !== 'IN_STOCK' && stockStatus !== 'OUT_OF_STOCK')) {
      res.status(400).json({ error: 'Invalid stockStatus. Must be "IN_STOCK" or "OUT_OF_STOCK".' });
      return;
    }

    const actor = req.user
      ? { id: req.user._id, name: req.user.fullName, role: req.user.role, ip: req.ip }
      : undefined;

    const updatedProduct = await ProductStockCleanupService.setProductStockStatus(
      id,
      stockStatus,
      actor
    );

    if (!updatedProduct) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    res.json({
      message: `Product "${updatedProduct.name}" is now marked as ${updatedProduct.stockStatus}.`,
      product: updatedProduct,
    });
  }

  /**
   * Super Admin Toggle Stock Availability
   */
  public static async toggleStock(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const product = store.products.find((p) => p._id === id);

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const isCurrentlyInStock = (product.stockStatus === 'IN_STOCK' || product.stockState === 'in_stock') && product.stock > 0;
    const targetStatus = isCurrentlyInStock ? 'OUT_OF_STOCK' : 'IN_STOCK';

    const actor = req.user
      ? { id: req.user._id, name: req.user.fullName, role: req.user.role, ip: req.ip }
      : undefined;

    const updatedProduct = await ProductStockCleanupService.setProductStockStatus(
      id,
      targetStatus,
      actor
    );

    res.json({
      message: `Stock for "${updatedProduct!.name}" is now ${updatedProduct!.stockStatus === 'IN_STOCK' ? 'In Stock' : 'Out of Stock (3-day auto-cleanup active)'}.`,
      product: updatedProduct,
    });
  }

  /**
   * Super Admin Delete ALL Out-of-Stock Products
   * DELETE /products/admin/out-of-stock and DELETE /products/out-of-stock
   */
  public static async deleteAllOutOfStock(req: AuthenticatedRequest, res: Response): Promise<void> {
    const actor = req.user
      ? { id: req.user._id, name: req.user.fullName, role: req.user.role, ip: req.ip }
      : undefined;

    const result = await ProductStockCleanupService.removeAllOutOfStockProducts(actor);

    res.json({
      success: true,
      message: `${result.deletedCount} out-of-stock product(s) removed successfully.`,
      count: result.deletedCount,
      deletedProducts: result.deletedProducts,
    });
  }

  /**
   * Trigger Manual 3-Day Expired Cleanup
   * POST /products/admin/cleanup-expired
   */
  public static async triggerCleanupExpired(req: AuthenticatedRequest, res: Response): Promise<void> {
    const result = await ProductStockCleanupService.cleanupExpiredProducts();
    res.json({
      success: true,
      message: `Expired out-of-stock cleanup executed. Removed ${result.deletedCount} product(s).`,
      count: result.deletedCount,
      deletedProducts: result.deletedProducts,
    });
  }

  /**
   * Super Admin Archive Product
   */
  public static async archiveProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const index = store.products.findIndex((p) => p._id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const [removed] = store.products.splice(index, 1);
    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: req.user!.role,
      action: 'PRODUCT_REMOVED',
      targetType: 'PRODUCT',
      targetId: id,
      ip: req.ip,
    });

    res.json({ message: `Product "${removed.name}" removed successfully.` });
  }
}
