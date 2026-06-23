import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/utils/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Expose only non-sensitive metadata (do not expose tokens to frontend)
    return NextResponse.json({
      authenticated: true,
      user: {
        email: session.email,
        expiresAt: new Date(session.expiry).toISOString(),
      },
    });
  } catch (error) {
    console.error('Session retrieval API error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Failed to retrieve active session' },
      { status: 500 }
    );
  }
}
