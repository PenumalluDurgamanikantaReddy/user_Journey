import { useState, useEffect } from 'react';

interface UseBigQueryDataProps {
  endpoint: string;
  params?: Record<string, string | number>;
  enabled?: boolean;
}

interface UseBigQueryDataResult<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch data from BigQuery via API
 * @param endpoint - API endpoint (e.g., '/api/data/users' or '/api/bigquery/query')
 * @param params - Query parameters
 * @param enabled - Whether to fetch on mount (default: true)
 */
export function useBigQueryData<T = any>(
  endpoint: string,
  params?: Record<string, string | number>,
  enabled: boolean = true
): UseBigQueryDataResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          queryParams.append(key, String(value));
        });
      }

      const url = params ? `${endpoint}?${queryParams.toString()}` : endpoint;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success === false) {
        throw new Error(result.error || 'Unknown error');
      }

      setData(result.data || result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [endpoint, JSON.stringify(params), enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook to execute raw SQL queries
 * @param sql - SQL query string
 * @param enabled - Whether to fetch on mount (default: true)
 */
export function useBigQuery<T = any>(
  sql: string,
  enabled: boolean = true
): UseBigQueryDataResult<T> {
  return useBigQueryData<T>(
    '/api/bigquery/query',
    { sql },
    enabled
  );
}
