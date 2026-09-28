import { Request, Response } from 'express';
import { store } from '../db/store.js';
import type { IHeroSlide } from '../../src/types/index.js';

export class HeroController {
  // Public - get all hero slides for storefront carousel
  static async getHeroSlides(req: Request, res: Response): Promise<void> {
    try {
      if (!store.heroSlides || store.heroSlides.length === 0) {
        store.heroSlides = store.getDefaultHeroSlides();
        store.saveToDisk();
      }
      const sorted = [...store.heroSlides].sort((a, b) => (a.order || 99) - (b.order || 99));
      res.json(sorted);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch hero carousel slides', error: (error as Error).message });
    }
  }

  // Admin - create hero slide
  static async createHeroSlide(req: Request, res: Response): Promise<void> {
    try {
      const {
        tag,
        title,
        subtitle,
        description,
        image,
        ctaText,
        secondaryCta,
        category,
        fabric,
        order,
        active,
      } = req.body;

      if (!title || !image) {
        res.status(400).json({ message: 'Title and Image URL are required' });
        return;
      }

      const now = new Date().toISOString();
      const newSlide: IHeroSlide = {
        _id: 'hero_' + store.generateId(),
        tag: String(tag || 'Festive Edit').trim(),
        title: String(title).trim(),
        subtitle: String(subtitle || '').trim(),
        description: String(description || '').trim(),
        image: String(image).trim(),
        ctaText: String(ctaText || 'Shop Collection').trim(),
        secondaryCta: secondaryCta ? String(secondaryCta).trim() : 'View All',
        category: String(category || 'all').trim(),
        fabric: fabric ? String(fabric).trim() : undefined,
        order: typeof order === 'number' ? order : (store.heroSlides.length + 1),
        active: active !== undefined ? Boolean(active) : true,
        createdAt: now,
        updatedAt: now,
      };

      store.heroSlides.push(newSlide);
      store.saveToDisk();

      res.status(201).json(newSlide);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create hero slide', error: (error as Error).message });
    }
  }

  // Admin - update hero slide
  static async updateHeroSlide(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        tag,
        title,
        subtitle,
        description,
        image,
        ctaText,
        secondaryCta,
        category,
        fabric,
        order,
        active,
      } = req.body;

      const idx = store.heroSlides.findIndex((s) => s._id === id);
      if (idx === -1) {
        res.status(404).json({ message: 'Hero slide not found' });
        return;
      }

      const existing = store.heroSlides[idx];
      store.heroSlides[idx] = {
        ...existing,
        tag: tag !== undefined ? String(tag).trim() : existing.tag,
        title: title !== undefined ? String(title).trim() : existing.title,
        subtitle: subtitle !== undefined ? String(subtitle).trim() : existing.subtitle,
        description: description !== undefined ? String(description).trim() : existing.description,
        image: image !== undefined ? String(image).trim() : existing.image,
        ctaText: ctaText !== undefined ? String(ctaText).trim() : existing.ctaText,
        secondaryCta: secondaryCta !== undefined ? (secondaryCta ? String(secondaryCta).trim() : undefined) : existing.secondaryCta,
        category: category !== undefined ? String(category).trim() : existing.category,
        fabric: fabric !== undefined ? (fabric ? String(fabric).trim() : undefined) : existing.fabric,
        order: typeof order === 'number' ? order : existing.order,
        active: active !== undefined ? Boolean(active) : existing.active,
        updatedAt: new Date().toISOString(),
      };

      store.saveToDisk();

      res.json(store.heroSlides[idx]);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update hero slide', error: (error as Error).message });
    }
  }

  // Admin - delete hero slide
  static async deleteHeroSlide(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const idx = store.heroSlides.findIndex((s) => s._id === id);
      if (idx === -1) {
        res.status(404).json({ message: 'Hero slide not found' });
        return;
      }

      const removed = store.heroSlides.splice(idx, 1)[0];
      store.saveToDisk();

      res.json({ message: `Hero slide "${removed.title}" deleted successfully`, id });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete hero slide', error: (error as Error).message });
    }
  }
}
