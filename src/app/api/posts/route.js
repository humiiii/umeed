import { db } from '@/lib/db';
import { postToZernio } from '@/lib/platforms/zernio';

export const dynamic = 'force-dynamic';

/**
 * Normalizes user-submitted platforms data into a clean array of strings.
 * Supports both array format: ['instagram', 'facebook']
 * and object format: { instagram: true, facebook: false }
 */
function getPlatformsArray(platforms) {
  if (Array.isArray(platforms)) {
    return platforms;
  }
  if (platforms && typeof platforms === 'object') {
    const arr = [];
    if (platforms.linkedin) arr.push('linkedin');
    if (platforms.facebook) arr.push('facebook');
    return arr;
  }
  return [];
}

export async function GET() {
  try {
    const rows = await db(
      "SELECT * FROM scheduled_posts ORDER BY scheduled_at ASC NULLS LAST"
    );

    // Format DB response to camelCase for the frontend page and components
    const posts = rows.map((row) => ({
      id: row.id,
      imageUrl: row.image_url,
      caption: row.caption,
      platforms: typeof row.platforms === 'string' ? JSON.parse(row.platforms) : row.platforms,
      scheduledAt: row.scheduled_at,
      status: row.status,
      createdAt: row.created_at,
    }));

    return Response.json({ posts });
  } catch (error) {
    console.error('Fetch scheduled posts error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { imageUrl, caption, platforms, scheduledAt } = body;

    // Validate inputs
    if (!caption && !imageUrl) {
      return Response.json(
        { error: 'Add a caption or image' },
        { status: 400 }
      );
    }

    const platformsArray = getPlatformsArray(platforms);
    if (platformsArray.length === 0) {
      return Response.json(
        { error: 'Select at least one platform' },
        { status: 400 }
      );
    }

    // Determine Mode
    const isImmediate = !scheduledAt;

    if (isImmediate) {
      // 1. Post Now Mode (via Zernio)
      try {
        const result = await postToZernio({ imageUrl, caption, platforms: platformsArray });
        const results = platformsArray.map(platform => ({
          platform,
          status: 'fulfilled',
          value: result
        }));
        return Response.json({ success: true, results }, { status: 200 });
      } catch (err) {
        return Response.json(
          { error: err.message || 'Failed to publish via Zernio' },
          { status: 500 }
        );
      }
    } else {
      // 2. Schedule Mode
      const id = crypto.randomUUID();
      
      // Keep DB inputs stringified/empty-mapped for NOT NULL safety constraints
      const imageUrlToInsert = imageUrl || '';
      const captionToInsert = caption || '';

      await db(
        'INSERT INTO scheduled_posts (id, image_url, caption, platforms, scheduled_at, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          id,
          imageUrlToInsert,
          captionToInsert,
          JSON.stringify(platformsArray),
          scheduledAt,
          'pending'
        ]
      );

      return Response.json(
        { success: true, id, scheduledAt },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Create post error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
