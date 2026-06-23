import { NextRequest, NextResponse } from 'next/server';
import { queryBigQueryRest } from '@/app/utils/bigqueryRest';
import { getSession } from '@/app/utils/session';

/**
 * GET /api/data/users
 * Fetch user data from BigQuery
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Ensure user has a valid authenticated session
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must log in with Google to query BigQuery.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '100';
    const userId = searchParams.get('userId');

    let sql = `SELECT * FROM \`${process.env.GOOGLE_CLOUD_PROJECT || 'dashboard-data-421414'}.users.users_table\` LIMIT ${limit}`;

    if (userId) {
      sql = `SELECT * FROM \`${process.env.GOOGLE_CLOUD_PROJECT || 'dashboard-data-421414'}.users.users_table\` WHERE user_id = '${userId}' LIMIT 1`;
    }

    const result = await queryBigQueryRest(sql, true); // Use cache for better performance

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.rowCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
