import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'OAuth setup is incomplete: GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI is not configured.' },
      { status: 500 }
    );
  }

  const scopes = [
    'openid',
    'email',
    'https://www.googleapis.com/auth/bigquery'
  ].join(' ');

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.append('client_id', clientId);
  googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.append('response_type', 'code');
  googleAuthUrl.searchParams.append('scope', scopes);
  googleAuthUrl.searchParams.append('access_type', 'offline');
  googleAuthUrl.searchParams.append('prompt', 'consent'); // Always ask for consent to ensure refresh token is returned

  return NextResponse.redirect(googleAuthUrl.toString());
}
