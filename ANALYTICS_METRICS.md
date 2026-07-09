# Analytics Metrics Documentation

This document describes the metric sources used by the dashboard boxes and the BigQuery tables/fields behind them.

## Overview

The dashboard aggregates data from several platform-specific analytics endpoints. Each platform uses one or more BigQuery tables and selects specific fields for the visual metrics.

The main metric boxes are:
- Social Media (Facebook + Instagram)
- Google Ads
- Meta Ads
- YouVersion
- Website
- AI Chat

## Social Media

Social Media is represented by two platform endpoints:
- `GET /api/analytics/facebook`
- `GET /api/analytics/instagram`

### Facebook

**Source tables**
- `dashboard-data-421414.globalrize_india.facebook_insights_combined_post_metrics`
- `dashboard-data-421414.globalrize_india.analytics_learnnn_events_combined`

**Metrics**
- `totalUsers`: `SUM(Organic_reach)` from `facebook_insights_combined_post_metrics`
- `courseJoins`: `SUM(Users)` from `analytics_learnnn_events_combined` where `LOWER(Source) LIKE '%facebook%' AND Event = 'Complete registration'`
- `comments`: `SUM(Post_comments)` from `facebook_insights_combined_post_metrics`
- `dms`: not available in this route; Meta Ads uses `facebook_ads_combined_conversions`

**Filters applied**
- `startDate` / `endDate` on `Date`
- `brand` applied to:
  - `Journey_brand_phase = @brand` for course joins
  - `Page_name = @brand` for post metrics
  - `Campaign_Name LIKE CONCAT('%', @brand, '%')` for ad conversions


### Instagram

**Source tables**
- `dashboard-data-421414.globalrize_india.instagram_insights_combined_post_metrics`
- `dashboard-data-421414.globalrize_india.instagram_insights_combined_engagement_metrics`
- `dashboard-data-421414.globalrize_india.instagram_insights_combined_follower_metrics_2`
- `dashboard-data-421414.globalrize_india.analytics_learnnn_events_combined`

**Metrics**
- `totalUsers`: `SUM(Media_reach)` from `instagram_insights_combined_post_metrics`
- `comments`: `SUM(Media_comments)` from `instagram_insights_combined_post_metrics`
- `dms`: `SUM(Media_follows)` from `instagram_insights_combined_post_metrics` (proxy for DMs)
- `courseJoins`: `SUM(Users)` from `analytics_learnnn_events_combined` where `LOWER(Source) LIKE '%instagram%' AND Event = 'Complete registration'`
- `followers`: `SUM(Current_Followers)` from `instagram_insights_combined_follower_metrics_2`

**Filters applied**
- `startDate` / `endDate` on `Date`
- `brand` applied to:
  - `LOWER(Name) LIKE LOWER(CONCAT('%', @brand, '%'))` for Instagram posts and engagement
  - `LOWER(Journey_brand_phase) LIKE LOWER(CONCAT('%', @brand, '%'))` for course joins
- `language` applied to `Page_language`

## Google Ads

**Endpoint**
- `GET /api/analytics/google-ads`

**Source table**
- `dashboard-data-421414.globalrize_india.google_ads_combined_conversions`

**Metrics**
- `totalUsers`: `SUM(Clicks)`
- `impressions`: `SUM(Impressions)`
- `courseJoins`: `SUM(Complete_Registration)`
- `courseStarts`: `SUM(Start_course)`
- `totalCost`: `ROUND(SUM(Cost), 2)`
- `assignedMentors`: `SUM(Assigned_mentor)`
- `comments`: `null` (not available)
- `dms`: `null` (not available)

**Filters applied**
- `startDate` / `endDate` on `Date`
- `brand` applied to `Account` or `Campaign`
- `countries` mapped from short codes to full `Country_Territory` names
- `language` applied to `Campaign_language`

## Meta Ads

**Endpoint**
- `GET /api/analytics/meta-ads`

**Source table**
- `dashboard-data-421414.globalrize_india.facebook_ads_combined_conversions`

**Metrics**
- `totalUsers`: `SUM(Reach)` if present, else `SUM(Impressions)`, else `COUNT(*)`
- `dms`: `SUM(Messaging_Conversations_Started)` if present, else `0`
- `courseJoins`: `SUM(...)` over one of several known registration columns, including:
  - `Complete_Registration`
  - `Completed_Registration`
  - `Complete_registration`
  - `Registrations_completed`
  - `Registration_completed`
  - `Leads`
- `comments`: `null`

**Filters applied**
- `startDate` / `endDate` on `Date`
- `brand` applied to `Campaign_Name LIKE CONCAT('%', @brand, '%')`

## Website

**Endpoint**
- `GET /api/analytics/website`

**Source tables**
- `dashboard-data-421414.globalrize_india.analytics_biblword_articles_combined`
- `dashboard-data-421414.globalrize_india.analytics_learnnn_events_combined`

**Metrics**
- `totalUsers`: `SUM(Users)` from `analytics_biblword_articles_combined`
- `sessions`: `SUM(Sessions)` from `analytics_biblword_articles_combined`
- `courseJoins`: `SUM(Users)` from `analytics_learnnn_events_combined` where `(LOWER(Source) LIKE '%biblword%' OR LOWER(Medium) LIKE '%organic%' OR LOWER(Source) LIKE '%website%') AND Event = 'Complete registration'`
- `totalEvents`: `SUM(Total_events)` from `analytics_biblword_articles_combined` as a proxy for website engagement/comments
- `topArticles`: top `Page_title`, `Page_path`, `SUM(Users)`, `SUM(Sessions)`
- `dms`: `null` (not tracked)

**Filters applied**
- `startDate` / `endDate` on `Date`
- `brand` applied to `LOWER(Platform) LIKE LOWER(CONCAT('%', @brand, '%'))` for site stats and `LOWER(Journey_brand_phase)` for course joins
- `language` applied to `Stream_name`

## YouVersion

**Endpoint**
- `GET /api/analytics/youversion`

**Source table**
- `dashboard-data-421414.globalrize_india.youversion_combined_language_statistics`

**Metrics**
- `totalUsers`: `SUM(Subscriptions)`
- `courseCompletions`: `SUM(Completions)`
- `avgCompletionRatePct`: `ROUND(AVG(Average_Completion_Rate) * 100, 2)`
- `avgRating`: `ROUND(AVG(NULLIF(Average_Overall_Ratings, 0)), 2)`
- `byLanguage`: top `Language`, `Language_Code`, `SUM(Subscriptions)`, `SUM(Completions)`
- `comments`: `null`
- `dms`: `null`

**Filters applied**
- `startDate` / `endDate` on month-based fields: `DATE(Year, Month_nr, 1)`
- `language` applied to `LOWER(Language)`

## AI Chat

**Endpoint**
- `GET /api/analytics/ai-chat`

**Source tables**
- `dashboard-data-421414.globalrize_india.echo_chat_statistics_combined`
- `dashboard-data-421414.globalrize_india.analytics_learnnn_events_combined`

**Metrics**
- `totalChats`: `COUNT(ID)` from `echo_chat_statistics_combined`
- `dms`: `COUNT(ID)` where `Closed_At IS NOT NULL` from `echo_chat_statistics_combined`
- `courseJoins`: `SUM(Users)` from `analytics_learnnn_events_combined` where `LOWER(Source) LIKE '%echo%' AND Event = 'Complete registration'`
- `comments`: `null` (not available)

**Filters applied**
- `startDate` / `endDate` on `Date`/`TIMESTAMP`
- `brand` applied to `Referrer` and `Journey_brand_phase`
- `language` applied to `Language`

## Important field keys for filter/value mapping

- Social media total users:
   Facebook: `Organic_reach`
   Instagram: `Media_reach`
    Social media comments:
  - Facebook: `Post_comments`
  - Instagram: `Media_comments`
- Social media DMs:
  - Facebook: `Messaging_Conversations_Started`
  - Instagram: `Media_follows` (proxy)
- Course joins across platforms:
  - `Users` from `analytics_learnnn_events_combined`
- Google Ads users:
  - `Clicks`
- Google Ads subscriptions/values:
  - `Complete_Registration` / `Start_course` / `Cost`
- YouVersion value key:
  - `Subscriptions` is used as `totalUsers`
  - `Completions` is used as `courseCompletions`

## Notes

- Phase filtering is not currently wired through the UI to the analytics endpoints; it is only present in the mock user filters. The analytics routes do use `Journey_brand_phase` or brand-like matching in some query filters, but UI phase selection is not yet passed into those requests.
- Meta Ads uses a flexible column detection strategy because the data schema can vary, so it chooses `Reach` first, then `Impressions`, and looks for several possible registration columns.
