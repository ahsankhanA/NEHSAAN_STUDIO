/**
 * High-Performance Image Optimization Utilities for Core Web Vitals
 * Generates WebP format, responsive srcset, and dimensions for fast rendering.
 */

export interface OptimizedImageSource {
  src: string;
  srcSet?: string;
  sizes?: string;
  isDataUrl: boolean;
}

/**
 * Transforms external or hosted image URLs into optimized WebP formats with width parameters
 */
export function getOptimizedImageUrl(
  url: string,
  width: number = 800,
  quality: number = 80,
  format: 'webp' | 'auto' = 'webp'
): string {
  if (!url) return '';
  if (url.startsWith('data:image')) {
    return url;
  }

  // Unsplash image optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('w', String(width));
      parsed.searchParams.set('q', String(quality));
      parsed.searchParams.set('fm', format);
      return parsed.toString();
    } catch {
      return url;
    }
  }

  // Cloudinary image optimization
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/f_webp,q_${quality},w_${width}/`);
  }

  // Pexels image optimization
  if (url.includes('images.pexels.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('auto', 'compress');
      parsed.searchParams.set('cs', 'tinysrgb');
      parsed.searchParams.set('w', String(width));
      return parsed.toString();
    } catch {
      return url;
    }
  }

  return url;
}

/**
 * Generates a responsive srcset string with WebP URLs for multiple screen resolutions
 */
export function getImageSrcSet(
  url: string,
  widths: number[] = [360, 480, 720, 960, 1200],
  quality: number = 80
): string | undefined {
  if (!url || url.startsWith('data:image')) {
    return undefined;
  }

  // Supported CDNs for dynamic width slicing
  if (url.includes('images.unsplash.com') || url.includes('cloudinary.com') || url.includes('images.pexels.com')) {
    return widths
      .map((w) => `${getOptimizedImageUrl(url, w, quality, 'webp')} ${w}w`)
      .join(', ');
  }

  return undefined;
}

/**
 * Ultra-lightweight SVG shimmer placeholder for zero Cumulative Layout Shift (CLS)
 */
export const SHIMMER_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 4"%3E%3Crect width="100%25" height="100%25" fill="%23f5f5f4"/%3E%3C/svg%3E';

/**
 * Standard responsive size attributes for high Core Web Vitals
 */
export const IMAGE_SIZES = {
  productCard: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  heroBanner: '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw',
  thumbnail: '80px',
  modal: '(max-width: 768px) 100vw, 600px',
};
