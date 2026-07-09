'use client';

import { useState, useEffect, useCallback } from 'react';
import { Medium } from '@/app/data/mockData';
import { AggregatedData, PlatformCounts } from '@/app/types/sankey';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  brand?: string;
  language?: string;
  /** comma-separated country list — only applied to Google Ads (only table with country data) */
  countries?: string;
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

    const EMPTY: AggregatedData = { platforms: [], grandTotal: 0, activeFilters: {} };

async function fetchPlatform(
  endpoint: string,
  filters: AnalyticsFilters,
  extraParams?: Record<string, string>
): Promise<any | null> {
  const params = new URLSearchParams();
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate)   params.set('endDate',   filters.endDate);
  if (filters.brand)     params.set('brand',     filters.brand);
  if (filters.language)  params.set('language',  filters.language);
  // countries only passed when explicitly provided via extraParams
  if (extraParams) {
    Object.entries(extraParams).forEach(([k, v]) => { if (v) params.set(k, v); });
  }
  const url = `${endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
  console.log('[fetchPlatform]', url);
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

  // Stable serialized key — re-fetch only when something meaningful changes
  const filtersKey = [
    filters.startDate,
    filters.endDate,
    filters.brand,
    filters.language,
    filters.countries,
    JSON.stringify(filters.contentSources),
    JSON.stringify(filters.conversationTypes),
  ].join('|');

  const fetchAll = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Decide which platforms to actually fetch
    const allPlatforms = ['facebook', 'instagram', 'google-ads', 'meta-ads', 'youversion', 'website', 'ai'];

    // Expand any UI-friendly aliases into actual platform keys used by the analytics endpoints.
    const aliasMap: Record<string, string[]> = {
      'social-media': ['facebook', 'instagram'],
    };

    const requested = filters.contentSources && filters.contentSources.length > 0
      ? filters.contentSources
      : allPlatforms;

    // Expand aliases (e.g. 'social-media' -> ['facebook','instagram'])
    const activePlatforms = requested.flatMap(p => aliasMap[p] ?? [p]);

    // Helper: only fetch if the platform is in the active set
    const shouldFetch = (p: string) => activePlatforms.includes(p);

    const [facebook, instagram, googleAds, metaAds, youversion, website, aiChat] = await Promise.all([
      shouldFetch('facebook')   ? fetchPlatform('/api/analytics/facebook',   filters) : Promise.resolve(null),
      shouldFetch('instagram')  ? fetchPlatform('/api/analytics/instagram',  filters) : Promise.resolve(null),
      shouldFetch('google-ads') ? fetchPlatform('/api/analytics/google-ads', filters,
        {
          ...(filters.countries ? { countries: filters.countries } : {}),
          ...(filters.language  ? { language:  filters.language  } : {}),
        }
      ) : Promise.resolve(null),
      shouldFetch('meta-ads')   ? fetchPlatform('/api/analytics/meta-ads',   filters) : Promise.resolve(null),
      shouldFetch('youversion') ? fetchPlatform('/api/analytics/youversion', filters) : Promise.resolve(null),
      shouldFetch('website')    ? fetchPlatform('/api/analytics/website',    filters) : Promise.resolve(null),
      shouldFetch('ai')         ? fetchPlatform('/api/analytics/ai-chat',    filters) : Promise.resolve(null),
    ]);

    // Which filters are active?
    const activeFilters = {
      language: filters.language,
      countries: filters.countries,
      brand: filters.brand,
    };

    // Platforms that support each filter (use string[] so backend platform keys are allowed)
    const LANGUAGE_SUPPORTED: string[] = ['youversion', 'ai', 'website', 'instagram', 'google-ads'];
    const COUNTRY_SUPPORTED:  string[] = ['google-ads'];

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

      if (filters.conversationTypes && filters.conversationTypes.length > 0) {
        if (!filters.conversationTypes.includes('comments')) comments = 0;
        if (!filters.conversationTypes.includes('dm'))       dms      = 0;
        if (!filters.conversationTypes.includes('courses'))  courses  = 0;
      }

      // Track which filters were actually applied to this platform
      const appliedFilters: string[] = [];
      if (filters.brand)     appliedFilters.push('brand');
      if (filters.language  && LANGUAGE_SUPPORTED.includes(medium)) appliedFilters.push('language');
      if (filters.countries && COUNTRY_SUPPORTED.includes(medium))  appliedFilters.push('country');

      platforms.push({ medium, total, comments, dms, courses, appliedFilters });
    };

    add('facebook',   facebook,   'totalUsers',  'comments',    'dms',  'courseJoins');
    add('instagram',  instagram,  'totalUsers',  'comments',    'dms',  'courseJoins');
    add('google-ads', googleAds,  'totalUsers',  null,          null,   'courseJoins');
    add('meta-ads',   metaAds,    'totalUsers',  null,          'dms',  'courseJoins');
    add('youversion', youversion, 'totalUsers',  null,          null,   'courseCompletions');
    add('website',    website,    'totalUsers',  null,          null,   'courseJoins');
    add('ai',         aiChat,     'totalChats',  null,          'dms',  'courseJoins');

    const grandTotal = platforms.reduce((s, p) => s + p.total, 0);

    // Debug: log Facebook/Instagram totals (social media) and Meta Ads separately
    try {
      const fbTotal = platforms.find(p => p.medium === 'facebook')?.total ?? 0;
      const igTotal = platforms.find(p => p.medium === 'instagram')?.total ?? 0;
      const socialMediaTotal = fbTotal + igTotal;
      const metaAdsTotal = platforms.find(p => p.medium === 'meta-ads')?.total ?? 0;
      console.info('[analytics debug] facebook:', fbTotal, 'instagram:', igTotal, 'socialMediaTotal:', socialMediaTotal, 'metaAds:', metaAdsTotal);
    } catch (e) {
      // swallow logging errors to avoid breaking UI
      // eslint-disable-next-line no-console
      console.warn('[analytics debug] failed to compute debug totals', e);
    }

    setState({
      data: { platforms, grandTotal, activeFilters },
      loading: false,
      error: grandTotal > 0 ? null : 'No data returned from analytics APIs.',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return state;
}
