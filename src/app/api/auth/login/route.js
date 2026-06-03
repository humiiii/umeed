import { cookies } from 'next/headers';
import { encrypt } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if the administrator password is set on the server
    if (!adminPassword) {
      return Response.json(
        { error: 'ADMIN_PASSWORD environment variable is missing on the server. Please configure it in your .env.local file.' },
        { status: 500 }
      );
    }

    // Verify password
    if (password !== adminPassword) {
      return Response.json(
        { error: 'Invalid password.' },
        { status: 401 }
      );
    }

    // Generate signed session (expires in 7 days)
    const sessionToken = encrypt({
      userId: 'admin',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    // Write httpOnly session cookie
    const cookieStore = await cookies();
    cookieStore.set('umeed_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Authentication login endpoint error:', error);
    return Response.json(
      { error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
