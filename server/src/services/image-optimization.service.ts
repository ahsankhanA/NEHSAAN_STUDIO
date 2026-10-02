let sharpModule: any = null;
let sharpChecked = false;

async function getSharpInstance(): Promise<any> {
  if (sharpChecked) return sharpModule;
  sharpChecked = true;
  try {
    const mod = await import('sharp');
    sharpModule = mod.default || mod;
  } catch {
    console.warn('[ImageOptimizer] Notice: native "sharp" package is optional. Base64 images will be passed through without local native transcoding.');
    sharpModule = null;
  }
  return sharpModule;
}

/**
 * Server-Side Image Optimization Service
 * Uses Sharp when available, with zero-crash safe fallback if native module is absent in cloud hosting.
 */
export class ImageOptimizationService {
  private static cache = new Map<string, string>();

  /**
   * Optimizes a Base64 data URL into a lightweight, high-performance WebP Base64 URL.
   * If sharp is unavailable or input is not Base64, returns original dataUrl safely.
   */
  public static async optimizeBase64Image(
    dataUrl: string,
    maxWidth: number = 800,
    quality: number = 80
  ): Promise<string> {
    if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
    if (!dataUrl.startsWith('data:image')) return dataUrl;

    // If already WebP and reasonably sized, skip
    if (dataUrl.startsWith('data:image/webp') && dataUrl.length < 50000) {
      return dataUrl;
    }

    // Check memory cache
    const cacheKey = `${dataUrl.slice(0, 100)}_${dataUrl.length}_${maxWidth}_${quality}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const sharp = await getSharpInstance();
      if (!sharp) {
        return dataUrl;
      }

      const parts = dataUrl.split(',');
      if (parts.length < 2) return dataUrl;

      const buffer = Buffer.from(parts[1], 'base64');
      const webpBuffer = await sharp(buffer)
        .resize({ width: maxWidth, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality, effort: 4 })
        .toBuffer();

      const optimizedUrl = `data:image/webp;base64,${webpBuffer.toString('base64')}`;
      this.cache.set(cacheKey, optimizedUrl);
      return optimizedUrl;
    } catch (err) {
      console.warn('[ImageOptimizer] Could not optimize image with sharp:', (err as Error).message);
      return dataUrl;
    }
  }

  /**
   * Optimizes an array of product image URLs
   */
  public static async optimizeProductImageList(
    images: string[],
    maxWidth: number = 800,
    quality: number = 80
  ): Promise<string[]> {
    if (!Array.isArray(images) || images.length === 0) return [];
    return Promise.all(images.map((img) => this.optimizeBase64Image(img, maxWidth, quality)));
  }
}
