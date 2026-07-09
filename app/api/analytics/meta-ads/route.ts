import { NextRequest, NextResponse } from 'next/server';
import { queryBigQueryRest } from '@/app/utils/bigqueryRest';
import { getSession } from '@/app/utils/session';

// Single source of truth — Meta Ads exclusively owns this table.
// Social media (Facebook, Instagram) no longer reads from it.
const adTable = '`dashboard-data-421414.globalrize_india.facebook_ads_combined_conversions`';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must log in with Google to query BigQuery.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate   = searchParams.get('endDate');
    const brand     = searchParams.get('brand');

    const params: Record<string, any> = {};
    let adFilters = `1=1`;

    if (startDate) {
      adFilters += ` AND Date >= CAST(@startDate AS DATE)`;
      params.startDate = startDate;
    }
    if (endDate) {
      adFilters += ` AND Date <= CAST(@endDate AS DATE)`;
      params.endDate = endDate;
    }
    if (brand) {
      adFilters += ` AND Campaign_Name LIKE CONCAT('%', @brand, '%')`;
      params.brand = brand;
    }

    // ── Step 1: get actual column names from INFORMATION_SCHEMA ────────────
    const schemaRes = await queryBigQueryRest(
      `SELECT column_name
       FROM \`dashboard-data-421414.globalrize_india.INFORMATION_SCHEMA.COLUMNS\`
       WHERE table_name = 'facebook_ads_combined_conversions'
       ORDER BY ordinal_position`,
      false,
      {}
    );

    const cols: string[] = schemaRes.success
      ? schemaRes.data.map((r: any) => r.column_name as string)
      : [];

    const has = (name: string) => cols.includes(name);

    // ── Step 2: build query using only confirmed columns ───────────────────
    // Total users — use Reach as the single content metric
    const totalExpr = has('Reach')
      ? 'SUM(Reach)'
      : has('Impressions')
      ? 'SUM(Impressions)'
      : 'COUNT(*)';

    // DMs — confirmed to work from facebook route
    const dmsExpr = has('Messaging_Conversations_Started')
      ? 'SUM(Messaging_Conversations_Started)'
      : '0';

    // Course registrations — try all known variants
    const courseCol = [
      'Complete_Registration',
      'Completed_Registration',
      'Complete_registration',
      'Registrations_completed',
      'Registration_completed',
      'Leads',
    ].find(c => has(c));
    const coursesExpr = courseCol ? `SUM(${courseCol})` : '0';

    const queryMain = `
      SELECT
        ${totalExpr}   AS total_users,
        ${dmsExpr}     AS total_dms,
        ${coursesExpr} AS course_joins
      FROM ${adTable}
      WHERE ${adFilters}
    `;

    const mainResult = await queryBigQueryRest(queryMain, false, params);

    if (!mainResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to fetch Meta Ads analytics data from BigQuery.',
          details: {
            queryError:   mainResult.error,
            detectedCols: cols,
            queryUsed:    queryMain,
          },
        },
        { status: 500 }
      );
    }

    const row = mainResult.data?.[0] || {};

    return NextResponse.json({
      success: true,
      data: {
        totalUsers:  Number(row.total_users  ?? 0),
        dms:         Number(row.total_dms    ?? 0),
        courseJoins: Number(row.course_joins ?? 0),
        comments:    null,
        // expose detected columns for debugging/inspection
        detectedCols: cols,
      },
    });

  } catch (error) {
    console.error('Meta Ads Analytics API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
