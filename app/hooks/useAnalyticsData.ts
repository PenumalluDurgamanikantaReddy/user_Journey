'use client';

import { useState, useEffect, useCallback } from 'react';
import { Medium } from '@/app/data/mockData';
import { AggregatedData, PlatformCounts } from '@/app/types/sankey';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  brand?: string;
  language?: string;
  /** platforms to include — undefined/empty = all */
  contentSources?: string[];
  /** conversation types to include — undefined/empty = all */
  conversationTypes?: string[];
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
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate)   params.set('endDate',   filters.endDate);
  if (filters.brand)     params.set('brand',     filters.brand);
  if (filters.language)  params.set('language',  filters.language);
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

    // Decide which platforms to actually fetch
    const allPlatforms = ['facebook', 'instagram', 'google-ads', 'meta-ads', 'youversion', 'website', 'ai'];
    const activePlatforms = filters.contentSources && filters.contentSources.length > 0
      ? filters.contentSources
      : allPlatforms;

    // Helper: only fetch if the platform is in the active set
    const shouldFetch = (p: string) => activePlatforms.includes(p);

    const [facebook, instagram, googleAds, metaAds, youversion, website, aiChat] = await Promise.all([
      shouldFetch('facebook')   ? fetchPlatform('/api/analytics/facebook',   filters) : Promise.resolve(null),
      shouldFetch('instagram')  ? fetchPlatform('/api/analytics/instagram',  filters) : Promise.resolve(null),
      shouldFetch('google-ads') ? fetchPlatform('/api/analytics/google-ads', filters) : Promise.resolve(null),
      shouldFetch('meta-ads')   ? fetchPlatform('/api/analytics/meta-ads',   filters) : Promise.resolve(null),
      shouldFetch('youversion') ? fetchPlatform('/api/analytics/youversion',
        filters.language ? { ...filters, language: filters.language } : filters
      ) : Promise.resolve(null),
      shouldFetch('website')    ? fetchPlatform('/api/analytics/website',    filters) : Promise.resolve(null),
      shouldFetch('ai')         ? fetchPlatform('/api/analytics/ai-chat',    filters) : Promise.resolve(null),
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

      let comments = commentsKey ? Number(raw[commentsKey] ?? 0) : 0;
      let dms      = dmsKey      ? Number(raw[dmsKey]      ?? 0) : 0;
      let courses  = coursesKey  ? Number(raw[coursesKey]  ?? 0) : 0;

      // Apply conversation type filter — zero out excluded types
      if (filters.conversationTypes && filters.conversationTypes.length > 0) {
        if (!filters.conversationTypes.includes('comments')) comments = 0;
        if (!filters.conversationTypes.includes('dm'))       dms      = 0;
        if (!filters.conversationTypes.includes('courses'))  courses  = 0;
      }

      platforms.push({ medium, total, comments, dms, courses });
    };

    add('facebook',   facebook,   'totalUsers',  'comments',    'dms',  'courseJoins');
    add('instagram',  instagram,  'totalUsers',  'comments',    'dms',  'courseJoins');
    add('google-ads', googleAds,  'totalUsers',  null,          null,   'courseJoins');
    add('meta-ads',   metaAds,    'totalUsers',  null,          'dms',  'courseJoins');
    add('youversion', youversion, 'totalUsers',  null,          null,   'courseCompletions');
    add('website',    website,    'totalUsers',  'totalEvents', null,   'courseJoins');
    add('ai',         aiChat,     'totalChats',  null,          'dms',  'courseJoins');

    const grandTotal = platforms.reduce((s, p) => s + p.total, 0);

    setState({
      data: { platforms, grandTotal },
      loading: false,
      error: grandTotal > 0 ? null : 'No data returned from analytics APIs.',
    });
  }, [filters.startDate, filters.endDate, filters.brand, filters.language,
      // stable stringify for arrays so useCallback doesn't re-run on every render
      JSON.stringify(filters.contentSources),
      JSON.stringify(filters.conversationTypes),
  ]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return state;
}
