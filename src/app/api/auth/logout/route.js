import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('umeed_session');
    return Response.json({ success: true });
  } catch (error) {
    console.error('Authentication logout endpoint error:', error);
    return Response.json(
      { error: 'Internal server error during logout.' },
      { status: 500 }
    );
  }
}
