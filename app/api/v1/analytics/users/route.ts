import { NextRequest, NextResponse } from 'next/server';
import { queryBigQueryRest } from '@/app/utils/bigqueryRest';
import { requireRole, verifyToken } from '@/app/utils/auth';
import { rateLimit, bigqueryLimiter } from '@/app/utils/rateLimit';
import { getSession } from '@/app/utils/session';

/**
 * GET /api/v1/analytics/users
 * 
 * Query Parameters:
 * - limit: number (default: 100, max: 10000)
 * - offset: number (default: 0)
 * - country: string (optional)
 * - dateRange: string (optional, format: "2024-01-01,2024-12-31")
 * 
 * Required Role: analyst
 * Rate Limit: 50 requests per minute
 */
export const GET = rateLimit(bigqueryLimiter)(requireRole('analyst')(handler));

async function handler(request: NextRequest) {
  try {
    // 1. Verify OAuth session
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must log in with Google to query BigQuery.' },
        { status: 401 }
      );
    }

    // Verify JWT role auth
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized JWT session' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 10000);
    const offset = parseInt(searchParams.get('offset') || '0');
    const country = searchParams.get('country');
    const dateRange = searchParams.get('dateRange');

    // Build WHERE clause with parameters
    const whereClauses: string[] = ['deleted_at IS NULL'];

    if (country) {
      whereClauses.push(`country = @country`);
    }

    if (dateRange) {
      whereClauses.push(`DATE(created_at) BETWEEN @startDate AND @endDate`);
    }

    // Build SQL query
    const sql = `
      SELECT 
        user_id,
        name,
        email,
        country,
        status,
        created_at,
        last_activity,
        total_purchases,
        total_spent
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT || 'dashboard-data-421414'}.users.users_table\`
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT @limit OFFSET @offset
    `;

    // Execute query with parameters using BigQuery REST API
    const result = await queryBigQueryRest(
      sql,
      true,
      {
        limit,
        offset,
        country: country || '',
        startDate: dateRange?.split(',')[0] || '',
        endDate: dateRange?.split(',')[1] || '',
      }
    );

    if (!result.success) {
      throw new Error(result.error || 'Query failed');
    }

    // Get total count (for pagination)
    const countSql = `
      SELECT COUNT(*) as total
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT || 'dashboard-data-421414'}.users.users_table\`
      WHERE ${whereClauses.join(' AND ')}
    `;

    const countResult = await queryBigQueryRest(
      countSql,
      true,
      {
        country: country || '',
        startDate: dateRange?.split(',')[0] || '',
        endDate: dateRange?.split(',')[1] || '',
      }
    );

    const total = countResult.success
      ? (countResult.data[0]?.total || 0)
      : 0;

    // Return response with metadata
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
        requestedBy: user.email,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
          'X-Request-ID': crypto.randomUUID(),
        },
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/analytics/custom-query
 * 
 * Allows analysts to run custom SQL queries
 * (with query validation and cost limits)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify OAuth session
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: You must log in with Google to query BigQuery.' },
        { status: 401 }
      );
    }

    // Verify authentication and role
    const user = await verifyToken(request);
    if (!user || user.role !== 'analyst') {
      return NextResponse.json(
        { error: 'Forbidden - analyst role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sql, params = {} } = body;

    if (!sql) {
      return NextResponse.json(
        { error: 'Missing sql parameter' },
        { status: 400 }
      );
    }

    // Validate query (simple checks)
    if (sql.toUpperCase().includes('DROP') ||
        sql.toUpperCase().includes('DELETE') ||
        sql.toUpperCase().includes('TRUNCATE')) {
      return NextResponse.json(
        { error: 'Destructive queries not allowed' },
        { status: 400 }
      );
    }

    // Execute query using BigQuery REST API
    const result = await queryBigQueryRest(
      sql,
      false,
      params
    );

    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      rowCount: result.data.length,
      executedBy: user.email,
    });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
