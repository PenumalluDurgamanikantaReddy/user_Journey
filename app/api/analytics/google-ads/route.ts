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

    let adsFilters = `1=1`;

    if (startDate) {
      adsFilters += ` AND Date >= CAST(@startDate AS DATE)`;
      params.startDate = startDate;
    }
    if (endDate) {
      adsFilters += ` AND Date <= CAST(@endDate AS DATE)`;
      params.endDate = endDate;
    }
    if (brand) {
      // google_ads uses Account or Campaign_course to identify brand
      adsFilters += ` AND (LOWER(Account) LIKE LOWER(CONCAT('%', @brand, '%')) OR LOWER(Campaign) LIKE LOWER(CONCAT('%', @brand, '%')))`;
      params.brand = brand;
    }

    const adsTable = '`dashboard-data-421414.globalrize_india.google_ads_combined_conversions`';

    // 1. Total users reached via Google Ads (unique clicks — best proxy for users)
    const queryTotal = `
      SELECT SUM(Clicks) AS total_users
      FROM ${adsTable}
      WHERE ${adsFilters}
    `;

    // 2. Total impressions (how many times ads were shown)
    const queryImpressions = `
      SELECT SUM(Impressions) AS total_impressions
      FROM ${adsTable}
      WHERE ${adsFilters}
    `;

    // 3. Course joins from Google Ads (Complete_Registration conversion event)
    const queryCourses = `
      SELECT SUM(Complete_Registration) AS course_joins
      FROM ${adsTable}
      WHERE ${adsFilters}
    `;

    // 4. Course starts (people who started a course from ads)
    const queryCourseStarts = `
      SELECT SUM(Start_course) AS course_starts
      FROM ${adsTable}
      WHERE ${adsFilters}
    `;

    // 5. Total ad spend
    const queryCost = `
      SELECT ROUND(SUM(Cost), 2) AS total_cost
      FROM ${adsTable}
      WHERE ${adsFilters}
    `;

    // Note: Google Ads does not have Comments or DMs — ads drive registrations/courses only.
    // Assigned_mentor is available as a downstream funnel step.
    const queryMentors = `
      SELECT SUM(Assigned_mentor) AS assigned_mentors
      FROM ${adsTable}
      WHERE ${adsFilters}
    `;

    const [totalResult, impressionsResult, coursesResult, courseStartsResult, costResult, mentorsResult] =
      await Promise.all([
        queryBigQueryRest(queryTotal,        false, params),
        queryBigQueryRest(queryImpressions,  false, params),
        queryBigQueryRest(queryCourses,      false, params),
        queryBigQueryRest(queryCourseStarts, false, params),
        queryBigQueryRest(queryCost,         false, params),
        queryBigQueryRest(queryMentors,      false, params),
      ]);

    const anyFailed = [totalResult, impressionsResult, coursesResult, courseStartsResult, costResult, mentorsResult]
      .some(r => !r.success);

    if (anyFailed) {
      return NextResponse.json(
        {
          error: 'Failed to fetch some Google Ads analytics data from BigQuery.',
          details: {
            totalError:        totalResult.error,
            impressionsError:  impressionsResult.error,
            coursesError:      coursesResult.error,
            courseStartsError: courseStartsResult.error,
            costError:         costResult.error,
            mentorsError:      mentorsResult.error,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        // Total users = people who clicked an ad
        totalUsers:      totalResult.data[0]?.total_users       || 0,
        impressions:     impressionsResult.data[0]?.total_impressions || 0,
        // Conversion funnel
        courseJoins:     coursesResult.data[0]?.course_joins    || 0,  // Complete_Registration
        courseStarts:    courseStartsResult.data[0]?.course_starts || 0,
        assignedMentors: mentorsResult.data[0]?.assigned_mentors || 0,
        totalCost:       costResult.data[0]?.total_cost         || 0,
        // Google Ads has no comments or DMs — set to null to distinguish from 0
        comments: null,
        dms:      null,
      },
    });

  } catch (error) {
    console.error('Google Ads Analytics API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
