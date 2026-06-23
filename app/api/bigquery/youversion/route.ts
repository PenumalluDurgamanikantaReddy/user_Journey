import { NextResponse } from 'next/server';
import { queryBigQueryRest } from '@/app/utils/bigqueryRest';
import { getSession } from '@/app/utils/session';

/**
 * GET /api/bigquery/youversion
 * Query the YouVersion BigQuery table and return the first rows.
 */
export async function GET() {
  try {
    // 1. Ensure user has a valid authenticated session
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must log in with Google to query BigQuery.' },
        { status: 401 }
      );
    }

    const sql = `SELECT COUNT(*) AS total_rows, SUM(SUBSCRIPTIONS) AS total_subscriptions FROM \`dashboard-data-421414.globalrize_india.youversion_combined_language_statistics\``;
    console.log('Running YouVersion BigQuery query (REST):', sql);

    const result = await queryBigQueryRest(sql, true);

    if (!result.success) {
      console.error('YouVersion query failed:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log('YouVersion query returned rows:', result.rowCount);

    return NextResponse.json({
      success: true,
      data: result.data,
      rowCount: result.rowCount,
    });
  } catch (error) {
    console.error('YouVersion GET route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
