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

    let siteFilters   = `1=1`;
    // Courses from learnnn — website/biblword traffic that converts to course registration
    let courseFilters = `(LOWER(Source) LIKE '%biblword%' OR LOWER(Medium) LIKE '%organic%' OR LOWER(Source) LIKE '%website%') AND Event = 'Complete registration'`;

    if (year) {
      siteFilters   += ` AND EXTRACT(YEAR FROM Date) = @year`;
      courseFilters += ` AND EXTRACT(YEAR FROM Date) = @year`;
      params.year = parseInt(year, 10);
    }
    if (month) {
      siteFilters   += ` AND EXTRACT(MONTH FROM Date) = @month`;
      courseFilters += ` AND EXTRACT(MONTH FROM Date) = @month`;
      params.month = parseInt(month, 10);
    }
    if (brand) {
      // analytics_biblword_articles_combined uses Platform column (e.g. "Biblword")
      siteFilters   += ` AND LOWER(Platform) LIKE LOWER(CONCAT('%', @brand, '%'))`;
      courseFilters += ` AND LOWER(Journey_brand_phase) LIKE LOWER(CONCAT('%', @brand, '%'))`;
      params.brand = brand;
    }

    const siteTable   = '`dashboard-data-421414.globalrize_india.analytics_biblword_articles_combined`';
    const courseTable = '`dashboard-data-421414.globalrize_india.analytics_learnnn_events_combined`';

    // 1. Total website users
    const queryTotal = `
      SELECT SUM(Users) AS total_users
      FROM ${siteTable}
      WHERE ${siteFilters}
    `;

    // 2. Total sessions
    const querySessions = `
      SELECT SUM(Sessions) AS total_sessions
      FROM ${siteTable}
      WHERE ${siteFilters}
    `;

    // 3. Course joins from website traffic
    const queryCourses = `
      SELECT SUM(Users) AS course_joins
      FROM ${courseTable}
      WHERE ${courseFilters}
    `;

    // 4. Comments — website engagement tracked via Total_events
    //    (direct comment count not available; Total_events is closest proxy)
    const queryComments = `
      SELECT SUM(Total_events) AS total_events
      FROM ${siteTable}
      WHERE ${siteFilters}
    `;

    // 5. Top articles by users
    const queryTopArticles = `
      SELECT Page_title, Page_path, SUM(Users) AS users, SUM(Sessions) AS sessions
      FROM ${siteTable}
      WHERE ${siteFilters}
      GROUP BY Page_title, Page_path
      ORDER BY users DESC
      LIMIT 5
    `;

    // Note: Website DMs are not tracked in this dataset — set to null.

    const [totalResult, sessionsResult, coursesResult, commentsResult, topArticlesResult] =
      await Promise.all([
        queryBigQueryRest(queryTotal,       false, params),
        queryBigQueryRest(querySessions,    false, params),
        queryBigQueryRest(queryCourses,     false, params),
        queryBigQueryRest(queryComments,    false, params),
        queryBigQueryRest(queryTopArticles, false, params),
      ]);

    const anyFailed = [totalResult, sessionsResult, coursesResult, commentsResult, topArticlesResult]
      .some(r => !r.success);

    if (anyFailed) {
      return NextResponse.json(
        {
          error: 'Failed to fetch some Website analytics data from BigQuery.',
          details: {
            totalError:       totalResult.error,
            sessionsError:    sessionsResult.error,
            coursesError:     coursesResult.error,
            commentsError:    commentsResult.error,
            topArticlesError: topArticlesResult.error,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers:   totalResult.data[0]?.total_users       || 0,
        sessions:     sessionsResult.data[0]?.total_sessions || 0,
        courseJoins:  coursesResult.data[0]?.course_joins    || 0,
        totalEvents:  commentsResult.data[0]?.total_events   || 0, // proxy for engagement/comments
        topArticles:  topArticlesResult.data,
        // DMs not available for website
        dms: null,
      },
    });

  } catch (error) {
    console.error('Website Analytics API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
