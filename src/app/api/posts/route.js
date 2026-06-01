import { db } from '@/lib/db';
import { postInstagram } from '@/lib/platforms/instagram';
import { postLinkedIn } from '@/lib/platforms/linkedin';
import { postFacebook } from '@/lib/platforms/facebook';

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
    if (platforms.instagram) arr.push('instagram');
    if (platforms.linkedin) arr.push('linkedin');
    if (platforms.facebook) arr.push('facebook');
    // Keep 'twitter'/'x' if present in existing structure
    if (platforms.twitter || platforms.x) arr.push('twitter');
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
      // 1. Post Now Mode
      const promises = [];
      const platformKeys = [];

      if (platformsArray.includes('instagram')) {
        promises.push(postInstagram({ imageUrl, caption }));
        platformKeys.push('instagram');
      }
      if (platformsArray.includes('linkedin')) {
        promises.push(postLinkedIn({ imageUrl, caption }));
        platformKeys.push('linkedin');
      }
      if (platformsArray.includes('facebook')) {
        promises.push(postFacebook({ imageUrl, caption }));
        platformKeys.push('facebook');
      }

      if (promises.length === 0) {
        return Response.json(
          { error: 'No supported active platforms chosen for immediate publishing' },
          { status: 400 }
        );
      }

      // Execute in parallel
      const settledResults = await Promise.allSettled(promises);
      const results = settledResults.map((res, index) => {
        const platform = platformKeys[index];
        if (res.status === 'fulfilled') {
          return { platform, status: 'fulfilled', value: res.value };
        } else {
          return { platform, status: 'rejected', error: res.reason?.message || String(res.reason) };
        }
      });

      return Response.json({ success: true, results }, { status: 200 });
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
