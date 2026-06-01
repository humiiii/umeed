import { getPosts, addPost } from '@/lib/store';

export async function GET() {
  const posts = getPosts({ status: 'scheduled' });
  return Response.json({ posts });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { caption, imageUrl, platforms, scheduledAt, mode } = body;

    if (!caption && !imageUrl) {
      return Response.json(
        { error: 'A caption or image is required' },
        { status: 400 }
      );
    }

    if (!platforms || platforms.length === 0) {
      return Response.json(
        { error: 'Select at least one platform' },
        { status: 400 }
      );
    }

    if (mode === 'scheduled' && !scheduledAt) {
      return Response.json(
        { error: 'Schedule time is required for scheduled posts' },
        { status: 400 }
      );
    }

    const post = addPost({
      caption,
      imageUrl,
      platforms,
      scheduledAt: scheduledAt || null,
      mode: mode || 'now',
    });

    return Response.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
