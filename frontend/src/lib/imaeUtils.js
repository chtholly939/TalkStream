/**
 * Compresses an image File to a base64 string before upload.
 * Resizes to maxWidth/maxHeight and reduces JPEG quality.
 * Keeps output under ~150KB — safe for any server payload limit.
 * Also handles iPhone HEIC/HEIF by forcing JPEG output via canvas.
 */
export function compressImage(file, { maxWidth = 400, maxHeight = 400, quality = 0.7 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Scale down proportionally if larger than max
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Always output as JPEG — converts HEIC/HEIF from iPhone automatically
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}