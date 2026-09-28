import { Request, Response } from 'express';
import { store } from '../db/store.js';
import { AuditService } from '../services/audit.service.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { ICategory } from '../../src/types/index.js';

export class CategoryController {
  /**
   * Public: Get all active categories with product counts
   */
  public static async getCategories(req: Request, res: Response): Promise<void> {
    const categoriesWithCount = store.categories.map((cat) => {
      const count = store.products.filter(
        (p) =>
          p.status !== 'archived' &&
          (p.category?.toLowerCase() === cat.name.toLowerCase() ||
            p.fabric?.toLowerCase().includes(cat.name.toLowerCase()) ||
            p.tags?.some((t) => t.toLowerCase() === cat.name.toLowerCase()))
      ).length;

      return {
        ...cat,
        productCount: count,
      };
    });

    res.json({ categories: categoriesWithCount });
  }

  /**
   * Super Admin: Create a new custom category
   */
  public static async createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Category name is required.' });
      return;
    }

    const trimmedName = name.trim();
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check duplicate
    const exists = store.categories.find(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase() || c.slug === slug
    );
    if (exists) {
      res.status(400).json({ error: `Category "${trimmedName}" already exists.` });
      return;
    }

    const now = new Date().toISOString();
    const newCategory: ICategory = {
      _id: `cat_${store.generateId()}`,
      name: trimmedName,
      slug: slug || `cat-${Date.now()}`,
      description: description ? description.trim() : '',
      order: store.categories.length + 1,
      createdAt: now,
      updatedAt: now,
    };

    store.categories.push(newCategory);
    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'CATEGORY_CREATED',
      targetType: 'CATEGORY',
      targetId: newCategory._id,
      metadata: { name: newCategory.name, slug: newCategory.slug },
      ip: req.ip,
    });

    res.status(201).json({
      message: `Category "${newCategory.name}" created successfully.`,
      category: { ...newCategory, productCount: 0 },
    });
  }

  /**
   * Super Admin: Update category
   */
  public static async updateCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, description } = req.body;

    const categoryIndex = store.categories.findIndex((c) => c._id === id || c.slug === id);
    if (categoryIndex === -1) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }

    if (name && typeof name === 'string' && name.trim()) {
      const trimmedName = name.trim();
      const duplicate = store.categories.find(
        (c, idx) => idx !== categoryIndex && c.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (duplicate) {
        res.status(400).json({ error: `Category "${trimmedName}" already exists.` });
        return;
      }
      store.categories[categoryIndex].name = trimmedName;
      store.categories[categoryIndex].slug = trimmedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    if (description !== undefined) {
      store.categories[categoryIndex].description = typeof description === 'string' ? description.trim() : '';
    }

    store.categories[categoryIndex].updatedAt = new Date().toISOString();
    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'CATEGORY_UPDATED',
      targetType: 'CATEGORY',
      targetId: id,
      metadata: { name: store.categories[categoryIndex].name },
      ip: req.ip,
    });

    res.json({
      message: 'Category updated successfully.',
      category: store.categories[categoryIndex],
    });
  }

  /**
   * Super Admin: Delete category
   */
  public static async deleteCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const categoryIndex = store.categories.findIndex((c) => c._id === id || c.slug === id);
    if (categoryIndex === -1) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }

    const removed = store.categories[categoryIndex];
    store.categories.splice(categoryIndex, 1);
    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'CATEGORY_DELETED',
      targetType: 'CATEGORY',
      targetId: id,
      metadata: { name: removed.name, slug: removed.slug },
      ip: req.ip,
    });

    res.json({
      message: `Category "${removed.name}" deleted successfully.`,
      categoryId: id,
    });
  }
}
