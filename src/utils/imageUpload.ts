/**
 * Client-side image compression and upload helper.
 * Automatically resizes camera/gallery photos to crisp, responsive web dimensions
 * ensuring instant upload, smooth mobile performance, and safe MongoDB storage.
 */
export async function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 1600,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling ratio
        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const bestRatio = Math.min(widthRatio, heightRatio);
          width = Math.round(width * bestRatio);
          height = Math.round(height * bestRatio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw image onto canvas with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized WebP data URL with JPEG fallback
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function processImageFiles(files: FileList | File[]): Promise<string[]> {
  const results: string[] = [];
  const fileArray = Array.from(files);

  for (const file of fileArray) {
    if (file.type.startsWith('image/')) {
      try {
        const compressed = await compressImage(file);
        results.push(compressed);
      } catch (err) {
        console.warn('Could not compress image:', err);
      }
    }
  }

  return results;
}
