import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary backend. 
// These variables should be added to your .env.local file:
// CLOUDINARY_CLOUD_NAME=your_cloud_name
// CLOUDINARY_API_KEY=your_api_key
// CLOUDINARY_API_SECRET=your_api_secret

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo'; // Fallback to demo account for testing

cloudinary.config({
  cloud_name: cloudName,
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

/**
 * Uploads a file to Cloudinary (Server-Side)
 * @param {string} fileUri - Path to file or Base64 data URI
 * @param {object} options - Optional cloudinary upload settings
 * @returns {Promise<object>} Upload response from Cloudinary
 */
export async function uploadToCloudinary(fileUri, options = {}) {
  try {
    const uploadOptions = {
      folder: 'umeed_uploads',
      resource_type: 'auto',
      ...options,
    };
    
    const result = await cloudinary.uploader.upload(fileUri, uploadOptions);
    return { success: true, data: result };
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return { success: false, error: error.message || error };
  }
}

/**
 * Deletes an asset from Cloudinary (Server-Side)
 * @param {string} publicId - The public ID of the asset on Cloudinary
 * @param {object} options - Optional cloudinary destroy settings
 * @returns {Promise<object>} Deletion result
 */
export async function deleteFromCloudinary(publicId, options = {}) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, options);
    return { success: true, data: result };
  } catch (error) {
    console.error('Cloudinary Deletion Error:', error);
    return { success: false, error: error.message || error };
  }
}

/**
 * Generates an optimized image URL with custom transformations
 * @param {string} publicId - Cloudinary asset public ID
 * @param {object} transforms - Custom width, height, crop, effects, quality, etc.
 * @returns {string} URL string
 */
export function getOptimizedImageUrl(publicId, transforms = {}) {
  const {
    width = 'auto',
    height,
    crop = 'scale',
    quality = 'auto',
    fetchFormat = 'auto',
    effect,
  } = transforms;

  // Build transform string
  let transformStr = `c_${crop},q_${quality},f_${fetchFormat}`;
  if (width !== 'auto') transformStr += `,w_${width}`;
  if (height) transformStr += `,h_${height}`;
  if (effect) transformStr += `,e_${effect}`;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${publicId}`;
}

export default cloudinary;
