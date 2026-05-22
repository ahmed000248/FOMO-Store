// ─── Free Image Hosting (Firestore Base64) ───────────────────────────────────
// This method compresses the image locally and converts it into a Base64 string. 
// It allows you to store the image DIRECTLY inside your free Firestore database, 
// bypassing Firebase Storage and entirely avoiding any external APIs or accounts!

/**
 * Compress image and convert to Base64 Data URL.
 */
export const uploadProductImage = async (file, onProgress) => {
  return new Promise((resolve, reject) => {
    if (onProgress) onProgress(10);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        if (onProgress) onProgress(40);
        
        // Create canvas to compress image
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Resize to max 800px width
        
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        if (onProgress) onProgress(80);
        
        // Convert to WebP format for massive compression (0.7 quality)
        const base64String = canvas.toDataURL('image/webp', 0.7);
        
        // Firestore limit is 1MB per document. Ensure we are safe.
        const sizeInBytes = base64String.length * 0.75;
        if (sizeInBytes > 900000) { 
          reject(new Error("Image is too detailed even after compression. Please use a simpler/smaller image."));
          return;
        }

        if (onProgress) onProgress(100);
        // The base64 string works EXACTLY like a standard image URL!
        resolve(base64String); 
      };
      
      img.onerror = () => reject(new Error("Failed to process image"));
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
};

/**
 * Deleting is automatic.
 * Since the Base64 string is saved directly inside the Firestore product document,
 * when you delete the product, the image is automatically deleted!
 */
export const deleteFileByUrl = async (url) => {
  return Promise.resolve();
};

/**
 * Upload a settings asset (logo / favicon / hero banner) as compressed Base64.
 * type: 'logo' | 'favicon' | 'hero'
 */
export const uploadSettingsImage = (file, type = 'logo', onProgress) =>
  new Promise((resolve, reject) => {
    if (onProgress) onProgress(10);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        if (onProgress) onProgress(40);
        const MAX_WIDTH  = type === 'favicon' ? 64   : type === 'logo' ? 400  : 1200;
        const quality    = type === 'favicon' ? 0.9  : type === 'logo' ? 0.85 : 0.72;
        let { width, height } = img;
        if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        if (onProgress) onProgress(80);
        const base64 = canvas.toDataURL('image/webp', quality);
        if (base64.length * 0.75 > 800000) {
          reject(new Error('Image too large after compression. Please use a smaller image.'));
          return;
        }
        if (onProgress) onProgress(100);
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Failed to process image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
