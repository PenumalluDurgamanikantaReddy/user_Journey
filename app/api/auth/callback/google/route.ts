import { NextRequest, NextResponse } from 'next/server';
import { setSession, SessionData, getSession } from '@/app/utils/session';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth callback returned error:', error);
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?error=missing_authorization_code', request.url));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Google OAuth configuration is incomplete in .env');
      return NextResponse.json({ error: 'OAuth credentials are not configured.' }, { status: 500 });
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenText = await tokenResponse.text();
    if (!tokenResponse.ok) {
      console.error('Google OAuth code exchange failed:', tokenText);
      return NextResponse.json({ error: 'Failed to exchange authorization code for tokens.' }, { status: 500 });
    }

    const tokenData = JSON.parse(tokenText);
    const { access_token, refresh_token, expires_in } = tokenData;

    // Fetch user info (email) from Google API
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userinfoResponse.ok) {
      console.error('Failed to fetch user email info from Google API');
      return NextResponse.json({ error: 'Failed to fetch user profile information.' }, { status: 500 });
    }

    const userinfo = await userinfoResponse.json();
    const email = userinfo.email;

    if (!email) {
      return NextResponse.json({ error: 'No email address associated with the Google account.' }, { status: 500 });
    }

    // Handle refresh token persistence
    let finalRefreshToken = refresh_token || null;
    
    // Fallback: If refresh_token is not in this exchange, try to keep the existing one if available
    if (!finalRefreshToken) {
      const existingSession = await getSession();
      if (existingSession && existingSession.email === email && existingSession.refreshToken) {
        finalRefreshToken = existingSession.refreshToken;
      }
    }

    // Create session payload
    const session: SessionData = {
      accessToken: access_token,
      refreshToken: finalRefreshToken,
      expiry: Date.now() + expires_in * 1000,
      email,
    };

    // Save session in encrypted cookie
    await setSession(session);

    // Redirect to home dashboard
    return NextResponse.redirect(new URL('/', request.url));
  } catch (err) {
    console.error('Error in OAuth callback processing:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown callback processing error' }, { status: 500 });
  }
}
