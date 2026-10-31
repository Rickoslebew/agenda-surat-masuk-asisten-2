/**
 * Mobile-friendly Image Optimization & Compression Utility
 * Specifically engineered for Smartphones (iPhone iOS Safari & Android Chrome)
 * 
 * Solves:
 * 1. iPhone 12MP-48MP camera files (5MB-20MB) exceeding localStorage quota or crashing Safari tab
 * 2. High-speed memory handling via URL.createObjectURL with FileReader fallback
 * 3. Aspect-ratio preserved downscaling to crisp document dimensions (max 1200x1200)
 * 4. High-efficiency JPEG compression (0.82) reducing file size to ~90-150KB
 * 5. Support for direct camera capture inputs and photo library selections
 */

export interface CompressionResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
}

export const getBase64SizeKb = (dataUrl: string): number => {
  if (!dataUrl) return 0;
  const base64Str = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return Math.round((base64Str.length * 3) / 4 / 1024);
};

export const compressMobileImage = async (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<CompressionResult> => {
  if (!file) {
    throw new Error('Tidak ada berkas foto yang dipilih.');
  }

  // Validate image type or extension
  const isImage =
    file.type.startsWith('image/') ||
    /\.(jpe?g|png|webp|heic|heif|bmp|gif)$/i.test(file.name);

  if (!isImage) {
    throw new Error('Format berkas harus berupa foto / gambar (JPG, PNG, atau WEBP).');
  }

  return new Promise((resolve, reject) => {
    let blobUrl: string | null = null;
    try {
      blobUrl = URL.createObjectURL(file);
    } catch (e) {
      console.warn('URL.createObjectURL failed, will fallback to FileReader:', e);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const cleanup = () => {
      if (blobUrl) {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {
          // ignore
        }
      }
    };

    const processImageElement = (loadedImg: HTMLImageElement) => {
      try {
        const canvas = document.createElement('canvas');
        let width = loadedImg.naturalWidth || loadedImg.width;
        let height = loadedImg.naturalHeight || loadedImg.height;

        if (!width || !height) {
          cleanup();
          reject(new Error('Dimensi foto tidak terbaca. Silakan coba ambil foto kembali.'));
          return;
        }

        // Calculate aspect-ratio preserved target dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          cleanup();
          reject(new Error('Perangkat tidak dapat menginisialisasi canvas grafis foto.'));
          return;
        }

        // Fill background with clean white (prevents black background if transparent PNG/canvas)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw and compress
        ctx.drawImage(loadedImg, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const sizeKb = getBase64SizeKb(dataUrl);

        cleanup();
        resolve({
          dataUrl,
          sizeKb,
          width,
          height,
        });
      } catch (err: any) {
        cleanup();
        reject(
          new Error(
            'Gagal mengoptimalkan foto dari handphone: ' + (err.message || 'Error pemrosesan canvas')
          )
        );
      }
    };

    img.onload = () => {
      processImageElement(img);
    };

    img.onerror = () => {
      cleanup();
      // Secondary fallback using FileReader
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          processImageElement(fallbackImg);
        };
        fallbackImg.onerror = () => {
          reject(
            new Error(
              'Foto dari kamera handphone tidak dapat ditampilkan. Harap coba ambil foto kembali atau pilih dari galeri.'
            )
          );
        };
        fallbackImg.src = readerEvent.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Gagal membaca berkas foto dari penyimpanan handphone.'));
      };
      reader.readAsDataURL(file);
    };

    if (blobUrl) {
      img.src = blobUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca berkas foto dari perangkat.'));
      reader.readAsDataURL(file);
    }
  });
};
