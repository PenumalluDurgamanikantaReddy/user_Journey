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

    let siteFilters   = `1=1`;
    let courseFilters = `(LOWER(Source) LIKE '%biblword%' OR LOWER(Medium) LIKE '%organic%' OR LOWER(Source) LIKE '%website%') AND Event = 'Complete registration'`;

    if (startDate) {
      siteFilters   += ` AND Date >= CAST(@startDate AS DATE)`;
      courseFilters += ` AND Date >= CAST(@startDate AS DATE)`;
      params.startDate = startDate;
    }
    if (endDate) {
      siteFilters   += ` AND Date <= CAST(@endDate AS DATE)`;
      courseFilters += ` AND Date <= CAST(@endDate AS DATE)`;
      params.endDate = endDate;
    }
    if (brand) {
      siteFilters   += ` AND LOWER(Platform) LIKE LOWER(CONCAT('%', @brand, '%'))`;
      courseFilters += ` AND LOWER(Journey_brand_phase) LIKE LOWER(CONCAT('%', @brand, '%'))`;
      params.brand = brand;
    }
    if (language) {
      // Website uses Stream_name for the language stream (e.g. "English", "Arabic")
      siteFilters += ` AND LOWER(Stream_name) = LOWER(@language)`;
      params.language = language;
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

    // 4. Top articles by users
    const queryTopArticles = `
      SELECT Page_title, Page_path, SUM(Users) AS users, SUM(Sessions) AS sessions
      FROM ${siteTable}
      WHERE ${siteFilters}
      GROUP BY Page_title, Page_path
      ORDER BY users DESC
      LIMIT 5
    `;

    // Note: Website DMs are not tracked in this dataset — set to null.

    const [totalResult, sessionsResult, coursesResult, topArticlesResult] =
      await Promise.all([
        queryBigQueryRest(queryTotal,       false, params),
        queryBigQueryRest(querySessions,    false, params),
        queryBigQueryRest(queryCourses,     false, params),
        queryBigQueryRest(queryTopArticles, false, params),
      ]);

    const anyFailed = [totalResult, sessionsResult, coursesResult, topArticlesResult]
      .some(r => !r.success);

    if (anyFailed) {
      return NextResponse.json(
        {
          error: 'Failed to fetch some Website analytics data from BigQuery.',
          details: {
            totalError:       totalResult.error,
            sessionsError:    sessionsResult.error,
            coursesError:     coursesResult.error,
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
        totalEvents:  0,
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
