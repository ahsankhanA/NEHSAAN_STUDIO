import { Request, Response } from 'express';
import { store } from '../db/store.js';
import type { IBoutique } from '../../src/types/index.js';

export class BoutiqueController {
  // Public - get all boutiques for store grid
  static async getBoutiques(req: Request, res: Response): Promise<void> {
    try {
      if (!store.boutiques || store.boutiques.length === 0) {
        store.boutiques = store.getDefaultBoutiques();
        store.saveToDisk();
      }
      const sorted = [...store.boutiques].sort((a, b) => (a.order || 99) - (b.order || 99));
      res.json(sorted);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch curated boutiques', error: (error as Error).message });
    }
  }

  // Admin - create boutique
  static async createBoutique(req: Request, res: Response): Promise<void> {
    try {
      const { name, subtitle, image, categoryQuery, fabricQuery, tag, order, active } = req.body;
      if (!name || !image) {
        res.status(400).json({ message: 'Name and Image URL are required' });
        return;
      }

      const now = new Date().toISOString();
      const newBoutique: IBoutique = {
        _id: 'boutique_' + store.generateId(),
        name: String(name).trim(),
        subtitle: String(subtitle || '').trim(),
        image: String(image).trim(),
        categoryQuery: String(categoryQuery || name).trim(),
        fabricQuery: fabricQuery ? String(fabricQuery).trim() : undefined,
        tag: tag ? String(tag).trim() : undefined,
        order: typeof order === 'number' ? order : (store.boutiques.length + 1),
        active: active !== undefined ? Boolean(active) : true,
        createdAt: now,
        updatedAt: now,
      };

      store.boutiques.push(newBoutique);
      store.saveToDisk();

      res.status(201).json(newBoutique);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create boutique', error: (error as Error).message });
    }
  }

  // Admin - update boutique
  static async updateBoutique(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, subtitle, image, categoryQuery, fabricQuery, tag, order, active } = req.body;

      const idx = store.boutiques.findIndex((b) => b._id === id);
      if (idx === -1) {
        res.status(404).json({ message: 'Curated Boutique not found' });
        return;
      }

      const existing = store.boutiques[idx];
      store.boutiques[idx] = {
        ...existing,
        name: name !== undefined ? String(name).trim() : existing.name,
        subtitle: subtitle !== undefined ? String(subtitle).trim() : existing.subtitle,
        image: image !== undefined ? String(image).trim() : existing.image,
        categoryQuery: categoryQuery !== undefined ? String(categoryQuery).trim() : existing.categoryQuery,
        fabricQuery: fabricQuery !== undefined ? (fabricQuery ? String(fabricQuery).trim() : undefined) : existing.fabricQuery,
        tag: tag !== undefined ? (tag ? String(tag).trim() : undefined) : existing.tag,
        order: typeof order === 'number' ? order : existing.order,
        active: active !== undefined ? Boolean(active) : existing.active,
        updatedAt: new Date().toISOString(),
      };

      store.saveToDisk();

      res.json(store.boutiques[idx]);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update boutique', error: (error as Error).message });
    }
  }

  // Admin - delete boutique
  static async deleteBoutique(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const idx = store.boutiques.findIndex((b) => b._id === id);
      if (idx === -1) {
        res.status(404).json({ message: 'Curated Boutique not found' });
        return;
      }

      const removed = store.boutiques.splice(idx, 1)[0];
      store.saveToDisk();

      res.json({ message: `Curated Boutique "${removed.name}" deleted successfully`, id });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete boutique', error: (error as Error).message });
    }
  }
}
