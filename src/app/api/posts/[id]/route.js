import { deletePost, getPost } from '@/lib/store';

export async function DELETE(request, { params }) {
  const { id } = await params;

  const post = getPost(id);
  if (!post) {
    return Response.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }

  deletePost(id);
  return Response.json({ success: true, id });
}
