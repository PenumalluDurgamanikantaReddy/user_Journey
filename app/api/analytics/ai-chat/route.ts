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

    // echo_chat Date column is a proper TIMESTAMP — use EXTRACT directly
    let chatFilters   = `1=1`;
    // Courses attributed from AI chat/echo
    let courseFilters = `LOWER(Source) LIKE '%echo%' AND Event = 'Complete registration'`;

    if (year) {
      // Date column is a proper TIMESTAMP — extract year directly
      chatFilters   += ` AND EXTRACT(YEAR FROM Date) = @year`;
      courseFilters += ` AND EXTRACT(YEAR FROM Date) = @year`;
      params.year = parseInt(year, 10);
    }
    if (month) {
      chatFilters   += ` AND EXTRACT(MONTH FROM Date) = @month`;
      courseFilters += ` AND EXTRACT(MONTH FROM Date) = @month`;
      params.month = parseInt(month, 10);
    }
    if (brand) {
      // echo_chat uses Referrer column for brand/page name (e.g. "Al Wujud", "She Rises")
      chatFilters   += ` AND LOWER(Referrer) LIKE LOWER(CONCAT('%', @brand, '%'))`;
      courseFilters += ` AND LOWER(Journey_brand_phase) LIKE LOWER(CONCAT('%', @brand, '%'))`;
      params.brand = brand;
    }

    const chatTable   = '`dashboard-data-421414.globalrize_india.echo_chat_statistics_combined`';
    const courseTable = '`dashboard-data-421414.globalrize_india.analytics_learnnn_events_combined`';

    // 1. Total AI chat conversations (each row = one conversation)
    const queryTotal = `
      SELECT COUNT(ID) AS total_chats
      FROM ${chatTable}
      WHERE ${chatFilters}
    `;

    // 2. DMs — in echo, every conversation IS a DM (1-on-1 chat).
    //    Completed chats = those with a Closed_At timestamp
    const queryDMs = `
      SELECT COUNT(ID) AS total_dms
      FROM ${chatTable}
      WHERE ${chatFilters}
        AND Closed_At IS NOT NULL
    `;

    // 3. Course joins from AI chat traffic
    const queryCourses = `
      SELECT SUM(Users) AS course_joins
      FROM ${courseTable}
      WHERE ${courseFilters}
    `;

    // 4. Breakdown by referring platform (Facebook, Instagram, etc.)
    const queryByType = `
      SELECT Type AS platform, COUNT(ID) AS chat_count
      FROM ${chatTable}
      WHERE ${chatFilters}
      GROUP BY Type
      ORDER BY chat_count DESC
    `;

    // 5. Breakdown by language
    const queryByLanguage = `
      SELECT Language, COUNT(ID) AS chat_count
      FROM ${chatTable}
      WHERE ${chatFilters}
      GROUP BY Language
      ORDER BY chat_count DESC
      LIMIT 10
    `;

    // Note: echo_chat doesn't have a "comments" metric — all interactions are DMs.
    const [totalResult, dmsResult, coursesResult, byTypeResult, byLanguageResult] =
      await Promise.all([
        queryBigQueryRest(queryTotal,       false, params),
        queryBigQueryRest(queryDMs,         false, params),
        queryBigQueryRest(queryCourses,     false, params),
        queryBigQueryRest(queryByType,      false, params),
        queryBigQueryRest(queryByLanguage,  false, params),
      ]);

    const anyFailed = [totalResult, dmsResult, coursesResult, byTypeResult, byLanguageResult]
      .some(r => !r.success);

    if (anyFailed) {
      return NextResponse.json(
        {
          error: 'Failed to fetch some AI Chat analytics data from BigQuery.',
          details: {
            totalError:      totalResult.error,
            dmsError:        dmsResult.error,
            coursesError:    coursesResult.error,
            byTypeError:     byTypeResult.error,
            byLanguageError: byLanguageResult.error,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        totalChats:   totalResult.data[0]?.total_chats    || 0,
        // In echo, every chat IS a DM; completedDMs = chats with outcome/closed
        dms:          dmsResult.data[0]?.total_dms        || 0,
        courseJoins:  coursesResult.data[0]?.course_joins || 0,
        byPlatform:   byTypeResult.data,
        byLanguage:   byLanguageResult.data,
        // Comments not applicable for AI chat (all interactions are DMs)
        comments: null,
      },
    });

  } catch (error) {
    console.error('AI Chat Analytics API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
