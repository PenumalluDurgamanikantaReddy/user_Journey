'use client';

import { useState, useEffect, useCallback } from 'react';
import { Medium } from '@/app/data/mockData';
import { AggregatedData, PlatformCounts } from '@/app/types/sankey';

export interface AnalyticsFilters {
  year?: string;
  month?: string;
  brand?: string;
}

interface AnalyticsState {
  data: AggregatedData;
  loading: boolean;
  error: string | null;
}

const EMPTY: AggregatedData = { platforms: [], grandTotal: 0 };

async function fetchPlatform(
  endpoint: string,
  filters: AnalyticsFilters
): Promise<any | null> {
  const params = new URLSearchParams();
  if (filters.year)  params.set('year',  filters.year);
  if (filters.month) params.set('month', filters.month);
  if (filters.brand) params.set('brand', filters.brand);
  const url = `${endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return json.data;
  } catch {
    return null;
  }
}

export function useAnalyticsData(filters: AnalyticsFilters): AnalyticsState {
  const [state, setState] = useState<AnalyticsState>({
    data: EMPTY,
    loading: true,
    error: null,
  });

  const fetchAll = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const [facebook, instagram, googleAds, youversion, website, aiChat] = await Promise.all([
      fetchPlatform('/api/analytics/facebook',   filters),
      fetchPlatform('/api/analytics/instagram',  filters),
      fetchPlatform('/api/analytics/google-ads', filters),
      fetchPlatform('/api/analytics/youversion', filters),
      fetchPlatform('/api/analytics/website',    filters),
      fetchPlatform('/api/analytics/ai-chat',    filters),
    ]);

    const platforms: PlatformCounts[] = [];

    const add = (
      medium: Medium,
      raw: any,
      totalKey: string,
      commentsKey: string | null,
      dmsKey: string | null,
      coursesKey: string | null
    ) => {
      if (!raw) return;
      const total = Number(raw[totalKey] ?? 0);
      if (total === 0) return;
      platforms.push({
        medium,
        total,
        comments : commentsKey ? Number(raw[commentsKey] ?? 0) : 0,
        dms      : dmsKey      ? Number(raw[dmsKey]      ?? 0) : 0,
        courses  : coursesKey  ? Number(raw[coursesKey]  ?? 0) : 0,
      });
    };

    add('facebook',   facebook,   'totalUsers',  'comments',    'dms',  'courseJoins');
    add('instagram',  instagram,  'totalUsers',  'comments',    'dms',  'courseJoins');
    add('google-ads', googleAds,  'totalUsers',  null,          null,   'courseJoins');
    add('youversion', youversion, 'totalUsers',  null,          null,   'courseCompletions');
    add('website',    website,    'totalUsers',  'totalEvents', null,   'courseJoins');
    add('ai',         aiChat,     'totalChats',  null,          'dms',  'courseJoins');

    const grandTotal = platforms.reduce((s, p) => s + p.total, 0);

    setState({
      data: { platforms, grandTotal },
      loading: false,
      error: grandTotal > 0 ? null : 'No data returned from analytics APIs.',
    });
  }, [filters.year, filters.month, filters.brand]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return state;
}
