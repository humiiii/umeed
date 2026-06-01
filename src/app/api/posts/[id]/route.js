import { db } from '@/lib/db';
import { deleteFromCloudinary } from '@/lib/cloudinary';

/**
 * Extracts Cloudinary asset public ID from its full URL
 * @param {string} url - Full Cloudinary URL
 * @returns {string|null} public ID or null
 */
function getPublicIdFromUrl(url) {
  if (!url || !url.startsWith('https://res.cloudinary.com')) return null;
  const parts = url.split('/upload/');
  if (parts.length < 2) return null;
  
  const path = parts[1];
  const segments = path.split('/');
  // Skip version string segment (e.g. "v12345678") if present
  const startIndex = (segments[0].startsWith('v') && !isNaN(segments[0].substring(1))) ? 1 : 0;
  
  const publicIdWithExtension = segments.slice(startIndex).join('/');
  const lastDot = publicIdWithExtension.lastIndexOf('.');
  if (lastDot === -1) return publicIdWithExtension;
  return publicIdWithExtension.substring(0, lastDot);
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Fetch the post from Neon DB to check for assets
    const rows = await db('SELECT * FROM scheduled_posts WHERE id = $1', [id]);
    if (rows.length === 0) {
      return Response.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = rows[0];

    // Delete post row from database
    await db('DELETE FROM scheduled_posts WHERE id = $1', [id]);

    // If an image was associated with the post, clean it up from Cloudinary
    if (post.image_url) {
      const publicId = getPublicIdFromUrl(post.image_url);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    return Response.json({ success: true, id });
  } catch (error) {
    console.error('Delete post route error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
