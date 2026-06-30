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
    // YouVersion doesn't have a brand filter in the schema — Language is used instead
    const language = searchParams.get('language');

    const params: Record<string, any> = {};

    let filters = `Language != '-Unknown-'`;

    if (startDate) {
      filters += ` AND DATE(Year, Month_nr, 1) >= DATE_TRUNC(CAST(@startDate AS DATE), MONTH)`;
      params.startDate = startDate;
    }
    if (endDate) {
      filters += ` AND DATE(Year, Month_nr, 1) <= DATE_TRUNC(CAST(@endDate AS DATE), MONTH)`;
      params.endDate = endDate;
    }
    if (language) {
      filters += ` AND LOWER(Language) LIKE LOWER(CONCAT('%', @language, '%'))`;
      params.language = language;
    }

    const yvTable = '`dashboard-data-421414.globalrize_india.youversion_combined_language_statistics`';

    // 1. Total users (subscribers on YouVersion plans)
    const queryTotal = `
      SELECT SUM(Subscriptions) AS total_users
      FROM ${yvTable}
      WHERE ${filters}
    `;

    // 2. Course completions (people who completed a YouVersion plan — closest to "courses")
    const queryCourses = `
      SELECT SUM(Completions) AS course_completions
      FROM ${yvTable}
      WHERE ${filters}
    `;

    // 3. Average completion rate
    const queryCompletionRate = `
      SELECT ROUND(AVG(Average_Completion_Rate) * 100, 2) AS avg_completion_rate_pct
      FROM ${yvTable}
      WHERE ${filters}
    `;

    // 4. Average rating
    const queryRating = `
      SELECT ROUND(AVG(NULLIF(Average_Overall_Ratings, 0)), 2) AS avg_rating
      FROM ${yvTable}
      WHERE ${filters}
    `;

    // 5. Language breakdown (top languages by subscriptions)
    const queryByLanguage = `
      SELECT Language, Language_Code, SUM(Subscriptions) AS subscriptions, SUM(Completions) AS completions
      FROM ${yvTable}
      WHERE ${filters}
      GROUP BY Language, Language_Code
      ORDER BY subscriptions DESC
      LIMIT 10
    `;

    // Note: YouVersion plans don't have Comments or DMs data.
    const [totalResult, coursesResult, completionRateResult, ratingResult, byLanguageResult] =
      await Promise.all([
        queryBigQueryRest(queryTotal,          false, params),
        queryBigQueryRest(queryCourses,        false, params),
        queryBigQueryRest(queryCompletionRate, false, params),
        queryBigQueryRest(queryRating,         false, params),
        queryBigQueryRest(queryByLanguage,     false, params),
      ]);

    const anyFailed = [totalResult, coursesResult, completionRateResult, ratingResult, byLanguageResult]
      .some(r => !r.success);

    if (anyFailed) {
      return NextResponse.json(
        {
          error: 'Failed to fetch some YouVersion analytics data from BigQuery.',
          details: {
            totalError:          totalResult.error,
            coursesError:        coursesResult.error,
            completionRateError: completionRateResult.error,
            ratingError:         ratingResult.error,
            byLanguageError:     byLanguageResult.error,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers:          totalResult.data[0]?.total_users              || 0,
        courseCompletions:   coursesResult.data[0]?.course_completions     || 0,
        avgCompletionRatePct: completionRateResult.data[0]?.avg_completion_rate_pct || 0,
        avgRating:           ratingResult.data[0]?.avg_rating              || 0,
        byLanguage:          byLanguageResult.data,
        // YouVersion has no Comments or DMs
        comments: null,
        dms:      null,
      },
    });

  } catch (error) {
    console.error('YouVersion Analytics API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
