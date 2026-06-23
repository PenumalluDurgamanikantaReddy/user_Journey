import { NextRequest, NextResponse } from 'next/server';
import { queryBigQueryRest } from '@/app/utils/bigqueryRest';
import { getSession } from '@/app/utils/session';

/**
 * GET /api/bigquery/query
 * Query BigQuery with a SQL query string
 * Query params: ?sql=SELECT * FROM dataset.table LIMIT 10
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
    const sql = searchParams.get('sql');

    if (!sql) {
      return NextResponse.json(
        { error: 'Missing sql parameter' },
        { status: 400 }
      );
    }

    // 2. Query BigQuery REST API using user's access token
    const result = await queryBigQueryRest(sql);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      rowCount: result.rowCount,
    });
  } catch (error) {
    console.error('REST BigQuery Query Route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bigquery/query
 * Query BigQuery with a SQL query in request body
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Ensure user has a valid authenticated session
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must log in with Google to query BigQuery.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sql, useCache } = body;

    if (!sql) {
      return NextResponse.json(
        { error: 'Missing sql in request body' },
        { status: 400 }
      );
    }

    // 2. Query BigQuery REST API using user's access token
    const result = await queryBigQueryRest(sql, useCache || false);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      rowCount: result.rowCount,
    });
  } catch (error) {
    console.error('REST BigQuery Query Route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
