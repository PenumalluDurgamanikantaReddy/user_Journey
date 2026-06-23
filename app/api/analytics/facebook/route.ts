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
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const brand = searchParams.get('brand');

    const params: Record<string, any> = {};

    // Base filter for course data (analytics_learnnn_events_combined)
    let courseFilters = `LOWER(Source) LIKE '%facebook%' AND Event = 'Complete registration'`;
    // Filter for post metrics (facebook_insights_combined_post_metrics)
    let postFilters = `1=1`;
    // Filter for ad conversions (facebook_ads_combined_conversions)
    let adFilters = `1=1`;

    if (year) {
      courseFilters += ` AND EXTRACT(YEAR FROM Date) = @year`;
      postFilters += ` AND EXTRACT(YEAR FROM Date) = @year`;
      adFilters += ` AND EXTRACT(YEAR FROM Date) = @year`;
      params.year = parseInt(year, 10);
    }
    if (month) {
      courseFilters += ` AND EXTRACT(MONTH FROM Date) = @month`;
      postFilters += ` AND EXTRACT(MONTH FROM Date) = @month`;
      adFilters += ` AND EXTRACT(MONTH FROM Date) = @month`;
      params.month = parseInt(month, 10);
    }
    if (brand) {
      courseFilters += ` AND Journey_brand_phase = @brand`; // Adjust column based on your brand matching logic
      postFilters += ` AND Page_name = @brand`; 
      adFilters += ` AND Campaign_Name LIKE CONCAT('%', @brand, '%')`;
      params.brand = brand;
    }

    const courseDataset = '`dashboard-data-421414.globalrize_india.analytics_learnnn_events_combined`';
    const postMetricsDataset = '`dashboard-data-421414.globalrize_india.facebook_insights_combined_post_metrics`';
    const adConversionsDataset = '`dashboard-data-421414.globalrize_india.facebook_ads_combined_conversions`';

    // 1. Total Facebook Users (using Organic Reach from posts)
    const queryTotal = `
      SELECT SUM(Organic_reach) as total_users 
      FROM ${postMetricsDataset} 
      WHERE ${postFilters}
    `;

    // 2. Course Joins from Facebook
    const queryCourseJoins = `
      SELECT SUM(Users) as course_joins 
      FROM ${courseDataset} 
      WHERE ${courseFilters}
    `;

    // 3. Comments from Facebook
    const queryComments = `
      SELECT SUM(Post_comments) as total_comments
      FROM ${postMetricsDataset} 
      WHERE ${postFilters}
    `;

    // 4. DMs from Facebook
    const queryDMs = `
      SELECT SUM(Messaging_Conversations_Started) as total_dms
      FROM ${adConversionsDataset} 
      WHERE ${adFilters}
    `;

    // Execute queries in parallel
    const [totalResult, courseJoinsResult, commentsResult, dmsResult] = await Promise.all([
      queryBigQueryRest(queryTotal, false, params),
      queryBigQueryRest(queryCourseJoins, false, params),
      queryBigQueryRest(queryComments, false, params),
      queryBigQueryRest(queryDMs, false, params),
    ]);

    if (!totalResult.success || !courseJoinsResult.success || !commentsResult.success || !dmsResult.success) {
      console.error("BigQuery Errors:", { totalResult, courseJoinsResult, commentsResult, dmsResult });
      return NextResponse.json(
        { 
          error: 'Failed to fetch some Facebook analytics data from BigQuery.',
          details: {
            totalError: totalResult.error,
            courseError: courseJoinsResult.error,
            commentsError: commentsResult.error,
            dmsError: dmsResult.error
          }
        },
        { status: 500 }
      );
    }

    const totalUsers = totalResult.data[0]?.total_users || 0;
    const courseJoins = courseJoinsResult.data[0]?.course_joins || 0;
    const comments = commentsResult.data[0]?.total_comments || 0;
    const dms = dmsResult.data[0]?.total_dms || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        courseJoins,
        comments,
        dms
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
