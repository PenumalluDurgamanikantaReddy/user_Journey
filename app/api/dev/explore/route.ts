import { NextResponse } from 'next/server';
import { queryBigQueryRest } from '@/app/utils/bigqueryRest';
import { getSession } from '@/app/utils/session';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const tables = [
      'youversion_combined_language_statistics',
      'analytics_biblword_articles_combined',
      'echo_chat_statistics_combined',
      'google_ads_combined_conversions',
      'instagram_insights_combined_engagement_metrics',
      'instagram_insights_combined_follower_metrics_2',
      'instagram_insights_combined_post_metrics',
      'instagram_insights_combined_profile_and_follower_metrics'
    ];

    const results: any = {};

    // Get Schema
    const schemaQuery = `
      SELECT table_name, column_name, data_type 
      FROM \`dashboard-data-421414.globalrize_india.INFORMATION_SCHEMA.COLUMNS\`
      WHERE table_name IN (${tables.map(t => `'${t}'`).join(', ')})
    `;
    const schemaRes = await queryBigQueryRest(schemaQuery);
    results.schema = schemaRes.success ? schemaRes.data : schemaRes.error;

    // Get 1 row from each table
    for (const table of tables) {
      const q = `SELECT * FROM \`dashboard-data-421414.globalrize_india.${table}\` LIMIT 3`;
      const res = await queryBigQueryRest(q);
      results[`sample_${table}`] = res.success ? res.data : res.error;
    }

    // Write to a local file so the AI can read it
    const filePath = path.join(process.cwd(), 'bq_analysis.json');
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: 'Analysis complete. File written to bq_analysis.json',
      data: results
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
