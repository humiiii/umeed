import { db } from '@/lib/db';
import { postInstagram } from '@/lib/platforms/instagram';
import { postLinkedIn } from '@/lib/platforms/linkedin';
import { postFacebook } from '@/lib/platforms/facebook';

export async function GET(request) {
  try {
    // 1. Guard check: secure the endpoint against external calls
    const cronSecret = process.env.CRON_SECRET;
    const incomingSecret = request.headers.get('x-cron-secret');

    if (!cronSecret || incomingSecret !== cronSecret) {
      return Response.json(
        { error: 'Unauthorized: Missing or invalid x-cron-secret header verification.' },
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

      const promises = [];
      const platformKeys = [];

      const hasPlatform = (platformName) => {
        if (Array.isArray(platforms)) {
          return platforms.includes(platformName);
        }
        return false;
      };

      // Populate promises for each configured target network
      if (hasPlatform('instagram')) {
        promises.push(postInstagram({ imageUrl, caption }));
        platformKeys.push('instagram');
      }
      if (hasPlatform('linkedin')) {
        promises.push(postLinkedIn({ imageUrl, caption }));
        platformKeys.push('linkedin');
      }
      if (hasPlatform('facebook')) {
        promises.push(postFacebook({ imageUrl, caption }));
        platformKeys.push('facebook');
      }

      if (promises.length === 0) {
        // Safe check: If no platforms were configured, auto-resolve to avoid queue blocking
        await db(
          "UPDATE scheduled_posts SET status = 'published' WHERE id = $1",
          [post.id]
        );
        processedResults.push({
          id: post.id,
          status: 'published',
          details: 'Skipped: No valid platforms were selected.'
        });
        continue;
      }

      // Execute platform publishing calls in parallel
      const settled = await Promise.allSettled(promises);
      const failures = settled.filter((s) => s.status === 'rejected');

      // If any of the target platforms fail, mark the post status as failed
      const finalStatus = failures.length === 0 ? 'published' : 'failed';

      await db(
        "UPDATE scheduled_posts SET status = $1 WHERE id = $2",
        [finalStatus, post.id]
      );

      processedResults.push({
        id: post.id,
        status: finalStatus,
        details: settled.map((s, idx) => ({
          platform: platformKeys[idx],
          status: s.status,
          error: s.status === 'rejected' ? s.reason?.message || String(s.reason) : undefined,
        }))
      });
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
