import { Response } from 'express';
import { store } from '../db/store.js';
import { AuditService } from '../services/audit.service.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { ISupplier } from '../../src/types/index.js';

export class SupplierController {
  public static async getSuppliers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const enriched = store.suppliers.map((s) => {
      const supplierProducts = store.products.filter((p) => p.supplierId === s._id);
      return {
        ...s,
        productsCount: supplierProducts.length,
      };
    });

    res.json({ suppliers: enriched });
  }

  public static async createSupplier(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { name, category, categorySpecialty, phone, whatsapp, address, city, contactPerson, notes } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: 'Please provide supplier name and phone number.' });
      return;
    }

    const resolvedCategory = (category || categorySpecialty || 'Ladies & Gents Apparel').trim();
    const resolvedAddress = (address || city || 'Pakistan').trim();
    const resolvedPhone = String(phone).trim();
    const resolvedWhatsapp = whatsapp ? String(whatsapp).trim() : resolvedPhone;

    const supplier: ISupplier = {
      _id: store.generateId(),
      name: String(name).trim(),
      category: resolvedCategory,
      phone: resolvedPhone,
      whatsapp: resolvedWhatsapp,
      address: resolvedAddress,
      notes: notes ? String(notes).trim() : (contactPerson ? `Contact: ${contactPerson}` : undefined),
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.suppliers.push(supplier);
    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'SUPPLIER_CREATED',
      targetType: 'SUPPLIER',
      targetId: supplier._id,
      metadata: { name: supplier.name, category: supplier.category },
      ip: req.ip,
    });

    res.status(201).json({ message: 'Supplier created successfully.', supplier });
  }

  public static async updateSupplier(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const supplier = store.suppliers.find((s) => s._id === id);

    if (!supplier) {
      res.status(404).json({ error: 'Supplier not found.' });
      return;
    }

    Object.assign(supplier, req.body);
    supplier.updatedAt = new Date().toISOString();
    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'SUPPLIER_UPDATED',
      targetType: 'SUPPLIER',
      targetId: supplier._id,
      ip: req.ip,
    });

    res.json({ message: 'Supplier updated successfully.', supplier });
  }

  public static async deleteSupplier(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const index = store.suppliers.findIndex((s) => s._id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Supplier not found.' });
      return;
    }

    const [deleted] = store.suppliers.splice(index, 1);
    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'SUPPLIER_DELETED',
      targetType: 'SUPPLIER',
      targetId: id,
      metadata: { name: deleted.name },
      ip: req.ip,
    });

    res.json({ message: `Supplier '${deleted.name}' deleted successfully.` });
  }
}

