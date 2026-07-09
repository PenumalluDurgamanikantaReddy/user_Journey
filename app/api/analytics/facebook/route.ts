import { NextRequest, NextResponse } from 'next/server';
import { queryBigQueryRest } from '@/app/utils/bigqueryRest';
import { getSession } from '@/app/utils/session';

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
    const endDate = searchParams.get('endDate');
    const brand = searchParams.get('brand');

    const params: Record<string, any> = {};

    // Base filter for course data (analytics_learnnn_events_combined)
    let courseFilters = `LOWER(Source) LIKE '%facebook%' AND Event = 'Complete registration'`;
    // Filter for post metrics (facebook_insights_combined_post_metrics)
    let postFilters = `1=1`;

    if (startDate) {
      courseFilters += ` AND Date >= CAST(@startDate AS DATE)`;
      postFilters += ` AND Date >= CAST(@startDate AS DATE)`;
      params.startDate = startDate;
    }
    if (endDate) {
      courseFilters += ` AND Date <= CAST(@endDate AS DATE)`;
      postFilters += ` AND Date <= CAST(@endDate AS DATE)`;
      params.endDate = endDate;
    }
    if (brand) {
      courseFilters += ` AND Journey_brand_phase = @brand`; // Adjust column based on your brand matching logic
      postFilters += ` AND Page_name = @brand`; 
      params.brand = brand;
    }

    const courseDataset = '`dashboard-data-421414.globalrize_india.analytics_learnnn_events_combined`';
    const postMetricsDataset = '`dashboard-data-421414.globalrize_india.facebook_insights_combined_post_metrics`';

    // ── Step 1: detect available columns in the post metrics table ──────────
    const schemaRes = await queryBigQueryRest(
      `SELECT column_name
       FROM \`dashboard-data-421414.globalrize_india.INFORMATION_SCHEMA.COLUMNS\`
       WHERE table_name = 'facebook_insights_combined_post_metrics'
       ORDER BY ordinal_position`,
      false,
      {}
    );

    const cols: string[] = schemaRes.success
      ? schemaRes.data.map((r: any) => r.column_name as string)
      : [];

    const has = (name: string) => cols.includes(name);

    // ── Step 2: choose a DM proxy column from the post metrics table ────────
    // Follow the Instagram pattern (Media_follows as DM proxy).
    // Facebook post metrics don't have a direct DM column; use the best available
    // engagement / follow metric as a proxy for one-to-one connection intent.
    const dmCandidates = [
      'Post_shares',
      'Post_likes',
      'Post_reactions',
      'Post_clicks',
      'Post_engagement',
      'Page_follows',
      'New_follows',
      'Total_interactions',
      'Post_total_interactions',
    ];
    const dmCol = dmCandidates.find(c => has(c));

    // ── Step 3: build queries ───────────────────────────────────────────────
    // Total Facebook Users (using Organic Reach from posts)
    const queryTotal = `
      SELECT SUM(Organic_reach) as total_users 
      FROM ${postMetricsDataset} 
      WHERE ${postFilters}
    `;

    // Course Joins from Facebook
    const queryCourseJoins = `
      SELECT SUM(Users) as course_joins 
      FROM ${courseDataset} 
      WHERE ${courseFilters}
    `;

    // Comments from Facebook
    const queryComments = `
      SELECT SUM(Post_comments) as total_comments
      FROM ${postMetricsDataset} 
      WHERE ${postFilters}
    `;

    // DMs proxy (if a suitable column was detected)
    const queryDMs = dmCol
      ? `SELECT SUM(${dmCol}) as total_dms FROM ${postMetricsDataset} WHERE ${postFilters}`
      : null;

    // ── Step 4: execute queries ─────────────────────────────────────────────
    const queries = [
      queryBigQueryRest(queryTotal, false, params),
      queryBigQueryRest(queryCourseJoins, false, params),
      queryBigQueryRest(queryComments, false, params),
      queryDMs ? queryBigQueryRest(queryDMs, false, params) : Promise.resolve(null),
    ] as const;

    const [totalResult, courseJoinsResult, commentsResult, dmsResult] = await Promise.all(queries);

    if (!totalResult.success || !courseJoinsResult.success || !commentsResult.success) {
      console.error("BigQuery Errors:", { totalResult, courseJoinsResult, commentsResult });
      return NextResponse.json(
        { 
          error: 'Failed to fetch some Facebook analytics data from BigQuery.',
          details: {
            totalError: totalResult.error,
            courseError: courseJoinsResult.error,
            commentsError: commentsResult.error,
          }
        },
        { status: 500 }
      );
    }

    const totalUsers = totalResult.data[0]?.total_users || 0;
    const courseJoins = courseJoinsResult.data[0]?.course_joins || 0;
    const comments = commentsResult.data[0]?.total_comments || 0;
    const dms = dmCol && dmsResult?.success
      ? (dmsResult.data[0]?.total_dms || 0)
      : null;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        courseJoins,
        comments,
        dms,
      }
    });

  } catch (error) {
    console.error('Facebook Analytics API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
