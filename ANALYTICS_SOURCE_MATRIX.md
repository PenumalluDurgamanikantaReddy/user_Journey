# Analytics Source Matrix

This matrix shows the seven main content sources and whether each conversation type is available in the current dashboard analytics implementation. For available items, it includes the source table or route path used in the project.

| Content Source | Comments | DMs | Courses |
|---|---|---|---|
| **Facebook** | Yes — `app/api/analytics/facebook/route.ts` uses `facebook_insights_combined_post_metrics` (`Post_comments`) | No — not available in `app/api/analytics/facebook/route.ts` | Yes — `app/api/analytics/facebook/route.ts` uses `analytics_learnnn_events_combined` where `LOWER(Source) LIKE '%facebook%' AND Event = 'Complete registration'` |
| **Instagram** | Yes — `app/api/analytics/instagram/route.ts` uses `instagram_insights_combined_post_metrics` (`Media_comments`) | Yes (proxy) — `app/api/analytics/instagram/route.ts` uses `instagram_insights_combined_post_metrics` (`Media_follows`) as a DM proxy | Yes — `app/api/analytics/instagram/route.ts` uses `analytics_learnnn_events_combined` where `LOWER(Source) LIKE '%instagram%' AND Event = 'Complete registration'` |
| **Google Ads** | No — not available in `app/api/analytics/google-ads/route.ts` | No — not available in `app/api/analytics/google-ads/route.ts` | Yes — `app/api/analytics/google-ads/route.ts` uses `google_ads_combined_conversions` (`Complete_Registration`) |
| **Meta Ads** | No — not available in `app/api/analytics/meta-ads/route.ts` | Yes — `app/api/analytics/meta-ads/route.ts` uses `facebook_ads_combined_conversions` (`Messaging_Conversations_Started`) | Yes — `app/api/analytics/meta-ads/route.ts` uses `facebook_ads_combined_conversions` with one of several registration columns such as `Complete_Registration`, `Completed_Registration`, `Leads`, etc. |
| **YouVersion** | No — not available in `app/api/analytics/youversion/route.ts` | No — not available in `app/api/analytics/youversion/route.ts` | Yes — `app/api/analytics/youversion/route.ts` uses `youversion_combined_language_statistics` (`Completions`) |
| **Website** | No — tracked as `totalEvents` proxy, not direct comments; `app/api/analytics/website/route.ts` uses `analytics_biblword_articles_combined` (`Total_events`) | No — not available in `app/api/analytics/website/route.ts` | Yes — `app/api/analytics/website/route.ts` uses `analytics_learnnn_events_combined` with website sources and `Event = 'Complete registration'` |
| **AI Chat** | No — not available in `app/api/analytics/ai-chat/route.ts` | Yes — `app/api/analytics/ai-chat/route.ts` uses `echo_chat_statistics_combined` (`Closed_At IS NOT NULL`) | Yes — `app/api/analytics/ai-chat/route.ts` uses `analytics_learnnn_events_combined` where `LOWER(Source) LIKE '%echo%' AND Event = 'Complete registration'` |

## Notes

- The matrix is based on the current Next.js analytics routes in `app/api/analytics/*`.
- `Comments` and `DMs` are not always direct metrics; some sources use proxies such as `Media_follows` for Instagram DMs and `Total_events` for Website engagement.
- `Courses` is implemented via course registration events in `analytics_learnnn_events_combined` for most traffic sources, or completion metrics in YouVersion.
- If you want a PDF version, you can convert this Markdown file with any Markdown-to-PDF tool.
