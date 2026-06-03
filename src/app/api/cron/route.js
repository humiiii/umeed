import { db } from '@/lib/db';
import { postToZernio } from '@/lib/platforms/zernio';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // 1. Guard check: secure the endpoint against external calls
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const incomingSecret = request.headers.get('x-cron-secret') || bearerToken;

    if (!cronSecret || incomingSecret !== cronSecret) {
      return Response.json(
        { error: 'Unauthorized: Missing or invalid x-cron-secret or Authorization Bearer header.' },
        { status: 401 }
      );
    }

    // 2. Fetch up to 20 pending posts whose scheduled time is due
    const duePosts = await db(
      "SELECT * FROM scheduled_posts WHERE scheduled_at <= NOW() AND status = 'pending' ORDER BY scheduled_at ASC LIMIT 20"
    );

    if (duePosts.length === 0) {
      return Response.json({
        processed: 0,
        results: [],
        message: 'No pending scheduled posts are currently due.'
      });
    }

    const processedResults = [];

    // 3. Process each due post
    for (const post of duePosts) {
      const platforms = typeof post.platforms === 'string' ? JSON.parse(post.platforms) : post.platforms;
      const imageUrl = post.image_url;
      const caption = post.caption;

      const platformsArray = Array.isArray(platforms) ? platforms : [];

      if (platformsArray.length === 0) {
        await db(
          "UPDATE scheduled_posts SET status = 'published' WHERE id = $1",
          [post.id]
        );
        processedResults.push({
          id: post.id,
          status: 'published',
          details: 'Skipped: No platforms were selected.'
        });
        continue;
      }

      try {
        await postToZernio({ imageUrl, caption, platforms: platformsArray });

        await db(
          "UPDATE scheduled_posts SET status = 'published' WHERE id = $1",
          [post.id]
        );

        processedResults.push({
          id: post.id,
          status: 'published',
          details: `Published via Zernio to: ${platformsArray.join(', ')}`
        });
      } catch (err) {
        await db(
          "UPDATE scheduled_posts SET status = 'failed' WHERE id = $1",
          [post.id]
        );

        processedResults.push({
          id: post.id,
          status: 'failed',
          details: err.message || 'Failed to publish via Zernio'
        });
      }
    }

    return Response.json({
      processed: duePosts.length,
      results: processedResults
    });
  } catch (error) {
    console.error('Scheduler cron process error:', error);
    return Response.json(
      { error: error.message || 'Internal server error during scheduler execution' },
      { status: 500 }
    );
  }
}
