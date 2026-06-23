import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/app/utils/session';

export async function POST(request: NextRequest) {
  try {
    await clearSession();
    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to clear session.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await clearSession();
  } catch (error) {
    console.error('Logout error:', error);
  }
  // Redirect back to home
  return NextResponse.redirect(new URL('/', request.url));
}
