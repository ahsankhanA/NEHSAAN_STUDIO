import { Request, Response } from 'express';
import { store } from '../db/store.js';
import type { IReview } from '../../src/types/index.js';

export class ReviewController {
  /**
   * Get reviews for a specific product
   */
  public static async getProductReviews(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reviews = store.reviews.filter((r) => r.productId === id);
      res.json({ reviews });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch reviews' });
    }
  }

  /**
   * Get testimonials for landing page social proof slider
   */
  public static async getLandingTestimonials(req: Request, res: Response): Promise<void> {
    try {
      // Prioritize verified buyers with 4-5 stars
      const testimonials = store.reviews
        .filter((r) => r.rating >= 4)
        .slice(0, 8);

      res.json({ testimonials });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch testimonials' });
    }
  }

  /**
   * Submit a new customer review with photo upload & verified buyer validation
   */
  public static async submitReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { customerName, customerPhone, customerEmail, rating, comment, photoUrl } = req.body;

      if (!customerName || !comment) {
        res.status(400).json({ error: 'Name and written review are required.' });
        return;
      }

      const numRating = parseInt(rating, 10);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        res.status(400).json({ error: 'Star rating must be between 1 and 5.' });
        return;
      }

      // Check product exists
      const product = store.products.find((p) => p._id === id);
      if (!product) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }

      // STRICT BACKEND VERIFIED BUYER CHECK:
      // Search store.orders to verify that this phone/email has a real order containing this product
      const cleanPhone = (customerPhone || '').replace(/[^0-9]/g, '');
      const cleanEmail = (customerEmail || '').trim().toLowerCase();

      let isVerifiedBuyer = false;
      if (cleanPhone || cleanEmail) {
        isVerifiedBuyer = store.orders.some((o) => {
          const orderPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
          const orderEmail = (o.customer?.email || '').trim().toLowerCase();
          const phoneMatch = cleanPhone && orderPhone && orderPhone === cleanPhone;
          const emailMatch = cleanEmail && orderEmail && orderEmail === cleanEmail;

          if (phoneMatch || emailMatch) {
            return o.items.some((it) => it.productId === id);
          }
          return false;
        });
      }

      // Secure photo upload validation
      let validatedPhoto: string | undefined;
      if (photoUrl) {
        if (typeof photoUrl !== 'string') {
          res.status(400).json({ error: 'Invalid photo format.' });
          return;
        }

        // Validate base64 or secure image URL
        const isDataUri = photoUrl.startsWith('data:image/');
        const isHttps = photoUrl.startsWith('https://');

        if (!isDataUri && !isHttps) {
          res.status(400).json({ error: 'Photo must be a valid HTTPS URL or image data URI.' });
          return;
        }

        // Validate MIME type
        if (isDataUri) {
          const validMime = /data:image\/(jpeg|jpg|png|webp);base64,/i.test(photoUrl);
          if (!validMime) {
            res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are permitted.' });
            return;
          }

          // Max 5MB check
          const approxSizeBytes = (photoUrl.length * 3) / 4;
          if (approxSizeBytes > 5 * 1024 * 1024) {
            res.status(400).json({ error: 'Photo size cannot exceed 5MB.' });
            return;
          }
        }

        validatedPhoto = photoUrl;
      }

      const newReview: IReview = {
        _id: store.generateId(),
        productId: id,
        customerName: customerName.trim(),
        customerPhone: cleanPhone || undefined,
        customerEmail: cleanEmail || undefined,
        rating: numRating,
        comment: comment.trim(),
        photoUrl: validatedPhoto,
        isVerifiedBuyer,
        createdAt: new Date().toISOString(),
      };

      store.reviews.unshift(newReview);
      store.saveToDisk();

      res.status(201).json({
        message: 'Review submitted successfully.',
        review: newReview,
        isVerifiedBuyer,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to submit review' });
    }
  }
}
