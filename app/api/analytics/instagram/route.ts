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
    const language = searchParams.get('language');

    const params: Record<string, any> = {};

    let postFilters = `1=1`;
    let courseFilters = `LOWER(Source) LIKE '%instagram%' AND Event = 'Complete registration'`;
    let engagementFilters = `1=1`;

    if (startDate) {
      postFilters       += ` AND Date >= CAST(@startDate AS DATE)`;
      courseFilters     += ` AND Date >= CAST(@startDate AS DATE)`;
      engagementFilters += ` AND Date >= CAST(@startDate AS DATE)`;
      params.startDate = startDate;
    }
    if (endDate) {
      postFilters       += ` AND Date <= CAST(@endDate AS DATE)`;
      courseFilters     += ` AND Date <= CAST(@endDate AS DATE)`;
      engagementFilters += ` AND Date <= CAST(@endDate AS DATE)`;
      params.endDate = endDate;
    }
    if (brand) {
      postFilters       += ` AND LOWER(Name) LIKE LOWER(CONCAT('%', @brand, '%'))`;
      engagementFilters += ` AND LOWER(Name) LIKE LOWER(CONCAT('%', @brand, '%'))`;
      courseFilters     += ` AND LOWER(Journey_brand_phase) LIKE LOWER(CONCAT('%', @brand, '%'))`;
      params.brand = brand;
    }
    if (language) {
      // Instagram uses Page_language (language of the Instagram page/account)
      postFilters       += ` AND LOWER(Page_language) = LOWER(@language)`;
      engagementFilters += ` AND LOWER(Page_language) = LOWER(@language)`;
      params.language = language;
    }

    const postMetricsTable   = '`dashboard-data-421414.globalrize_india.instagram_insights_combined_post_metrics`';
    const engagementTable    = '`dashboard-data-421414.globalrize_india.instagram_insights_combined_engagement_metrics`';
    const followerTable      = '`dashboard-data-421414.globalrize_india.instagram_insights_combined_follower_metrics_2`';
    const courseTable        = '`dashboard-data-421414.globalrize_india.analytics_learnnn_events_combined`';

    // 1. Total Instagram Users — sum of Media_reach across all posts
    const queryTotal = `
      SELECT SUM(Media_reach) AS total_users
      FROM ${postMetricsTable}
      WHERE ${postFilters}
    `;

    // 2. Comments — sum of Engagements from engagement_metrics where Engagement_type = 'Comments'
    const queryComments = `
      SELECT SUM(Engagements) AS total_comments
      FROM ${engagementTable}
      WHERE Engagement_type = 'Comments' AND ${engagementFilters}
    `;

    // 3. DMs — Instagram doesn't expose DMs directly in insights;
    //    using Media_follows as the closest proxy (people who followed after seeing a post)
    //    This is the best available signal for direct intent from Instagram posts.
    const queryDMs = `
      SELECT SUM(Media_follows) AS total_dms
      FROM ${postMetricsTable}
      WHERE ${postFilters}
    `;

    // 4. Course joins attributed to Instagram (via learnnn events)
    const queryCourses = `
      SELECT SUM(Users) AS course_joins
      FROM ${courseTable}
      WHERE ${courseFilters}
    `;

    // 5. Follower count (latest snapshot per brand/username)
    const queryFollowers = `
      SELECT SUM(Current_Followers) AS total_followers
      FROM ${followerTable}
      WHERE ${postFilters}
    `;

    const [totalResult, commentsResult, dmsResult, coursesResult, followersResult] = await Promise.all([
      queryBigQueryRest(queryTotal, false, params),
      queryBigQueryRest(queryComments, false, params),
      queryBigQueryRest(queryDMs, false, params),
      queryBigQueryRest(queryCourses, false, params),
      queryBigQueryRest(queryFollowers, false, params),
    ]);

    const anyFailed = [totalResult, commentsResult, dmsResult, coursesResult, followersResult]
      .some(r => !r.success);

    if (anyFailed) {
      return NextResponse.json(
        {
          error: 'Failed to fetch some Instagram analytics data from BigQuery.',
          details: {
            totalError:     totalResult.error,
            commentsError:  commentsResult.error,
            dmsError:       dmsResult.error,
            coursesError:   coursesResult.error,
            followersError: followersResult.error,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers:   totalResult.data[0]?.total_users    || 0,
        comments:     commentsResult.data[0]?.total_comments || 0,
        dms:          dmsResult.data[0]?.total_dms        || 0,  // proxy: post follows
        courseJoins:  coursesResult.data[0]?.course_joins || 0,
        followers:    followersResult.data[0]?.total_followers || 0,
      },
    });

  } catch (error) {
    console.error('Instagram Analytics API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
