import { getSession, setSession, SessionData } from './session';

export interface BigQueryField {
  name: string;
  type: string;
  mode?: string;
  fields?: BigQueryField[];
}

export interface BigQueryValue {
  v: any;
}

export interface BigQueryRow {
  f: BigQueryValue[];
}

/**
 * Exchanges a Refresh Token for a new Access Token with Google OAuth
 */
export async function refreshGoogleToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Google client credentials are not configured in environment variables');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Failed to refresh Google token: ${response.statusText}. Details: ${text}`);
  }

  const data = JSON.parse(text);
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Retrieves the access token from the active session.
 * If the access token is close to expiry, it attempts to refresh it.
 */
export async function getValidAccessToken(): Promise<string> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized: No active session found');
  }

  // Check if token is within 5 minutes of expiring
  const bufferTime = 5 * 60 * 1000;
  const isExpired = Date.now() + bufferTime >= session.expiry;

  if (isExpired) {
    if (!session.refreshToken) {
      throw new Error('Unauthorized: Google Access Token has expired and no Refresh Token is available');
    }

    try {
      console.log('Access token is expiring. Refreshing OAuth token...');
      const { accessToken, expiresIn } = await refreshGoogleToken(session.refreshToken);
      
      const updatedSession: SessionData = {
        ...session,
        accessToken,
        expiry: Date.now() + expiresIn * 1000,
      };

      await setSession(updatedSession);
      return accessToken;
    } catch (error) {
      console.error('Failed to refresh Google OAuth token:', error);
      throw new Error('Unauthorized: Failed to refresh access token');
    }
  }

  return session.accessToken;
}

/**
 * Formats raw BigQuery REST rows of the shape [{ f: [{ v: "val" }] }]
 * into readable key-value objects using the schema.
 */
export function formatBigQueryRows(fields: BigQueryField[], rows: BigQueryRow[]): Record<string, any>[] {
  if (!rows || !fields) return [];
  
  return rows.map((row) => {
    const formatted: Record<string, any> = {};
    row.f.forEach((cell, idx) => {
      const field = fields[idx];
      if (field) {
        formatted[field.name] = parseValue(cell.v, field);
      }
    });
    return formatted;
  });
}

function parseValue(val: any, field: BigQueryField): any {
  if (val === null || val === undefined) return null;

  switch (field.type) {
    case 'INTEGER':
    case 'INT64':
      return parseInt(val, 10);
    case 'FLOAT':
    case 'FLOAT64':
      return parseFloat(val);
    case 'BOOLEAN':
    case 'BOOL':
      return val === 'true';
    case 'RECORD':
    case 'STRUCT':
      if (field.fields && Array.isArray(val)) {
        return val.map((item) => {
          const inner: Record<string, any> = {};
          if (item.v && Array.isArray(item.v.f)) {
            item.v.f.forEach((innerCell: any, innerIdx: number) => {
              const innerField = field.fields![innerIdx];
              if (innerField) {
                inner[innerField.name] = parseValue(innerCell.v, innerField);
              }
            });
          }
          return inner;
        });
      } else if (field.fields && val && typeof val === 'object' && val.f) {
        const inner: Record<string, any> = {};
        val.f.forEach((innerCell: any, innerIdx: number) => {
          const innerField = field.fields![innerIdx];
          if (innerField) {
            inner[innerField.name] = parseValue(innerCell.v, innerField);
          }
        });
        return inner;
      }
      return val;
    default:
      return val;
  }
}

function getParamType(value: any): string {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'INT64' : 'FLOAT64';
  }
  if (typeof value === 'boolean') return 'BOOL';
  if (value instanceof Date) return 'TIMESTAMP';
  return 'STRING';
}

/**
 * Execute a SQL query on Google BigQuery via the REST API using OAuth (supports named parameters)
 */
export async function queryBigQueryRest(
  query: string,
  useQueryCache: boolean = false,
  params?: Record<string, any>
): Promise<{ success: boolean; data: any[]; rowCount: number; error?: string }> {
  try {
    const accessToken = await getValidAccessToken();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'dashboard-data-421414';
    
    const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`;
    
    console.log(`Executing REST BigQuery query for project: ${projectId}`);
    
    // Map Javascript types to BigQuery REST API parameters
    const queryParameters = params && Object.keys(params).length > 0
      ? Object.entries(params).map(([name, value]) => ({
          name,
          parameterType: { type: getParamType(value) },
          parameterValue: { value: String(value) },
        }))
      : undefined;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        useLegacySql: false,
        useQueryCache,
        queryParameters,
        parameterMode: queryParameters ? 'NAMED' : undefined,
      }),
    });

    const resultBody = await response.json();

    if (!response.ok) {
      console.error('BigQuery REST API returned an error status:', response.status, resultBody);
      
      if (response.status === 401) {
        return {
          success: false,
          error: 'Authentication failed. Please log in again.',
          data: [],
          rowCount: 0,
        };
      }
      
      const errorMsg = resultBody?.error?.message || response.statusText;
      return {
        success: false,
        error: `BigQuery REST Error: ${errorMsg}`,
        data: [],
        rowCount: 0,
      };
    }

    const fields = resultBody.schema?.fields || [];
    const rows = resultBody.rows || [];
    const formattedData = formatBigQueryRows(fields, rows);

    return {
      success: true,
      data: formattedData,
      rowCount: formattedData.length,
    };
  } catch (error) {
    console.error('BigQuery REST request execution error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown REST BigQuery error',
      data: [],
      rowCount: 0,
    };
  }
}
