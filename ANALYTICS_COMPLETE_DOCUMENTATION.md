# Analytics Data Documentation

This document explains how the dashboard data is collected and built. It is written for non-technical readers, so it avoids deep code details and focuses on where the content and conversation numbers come from.

## What this dashboard shows

The dashboard has three main columns:
- **Content**: where the user came from (Facebook, Instagram, Google Ads, Meta Ads, YouVersion, Website, AI Chat, Daily Devotionals)
- **Conversation**: what happened next (Comments, Direct Messages, Courses)
- **Goal**: the final outcome (currently shown as Church, planned future work)

The data is built from several backend routes and BigQuery tables.

## How we get content data

Content data is the first step in the journey. It is gathered from the main platform sources using one backend route per platform.

### Social Media

Social Media is a combined category for:
- Facebook
- Instagram

These are collected separately and then shown together in the dashboard. The code treats `social-media` as a friendly label in the filters, and behind the scenes it fetches both Facebook and Instagram data.

For Social Media:
- **Facebook** total count comes from post reach data (how many people saw Facebook posts)
- **Instagram** total count comes from post reach data for Instagram

### Google Ads

Google Ads content is based on ad clicks and impressions from the Google Ads table.

### Meta Ads

Meta Ads uses the same data source as Facebook ads, but it is treated as a separate platform.

### YouVersion

YouVersion content comes from a table of app statistics. The total number is based on subscriptions and language usage.

### Website

Website content comes from a website analytics table. This is the place where the dashboard uses real website traffic numbers:
- Users
- Sessions

### AI Chat

AI Chat content is taken from a chat tracking table, where each chat is considered a conversation.

## How we get conversation data

Conversation data is the second step in the journey. It includes:
- **Comments**
- **Direct Messages**
- **Courses**

### Comments

Comments are taken from the platform tables when the platform provides direct comment counts.

Examples:
- Facebook: `Post_comments`
- Instagram: `Media_comments`
- Website: comments are not shown, because the dashboard no longer treats website traffic as a comments connection.

### Direct Messages (DMs)

Some platforms provide real DM counts, while others use a proxy:
- Facebook: `Messaging_Conversations_Started`
- Instagram: `Media_follows` is used as a proxy for DMs (because the direct DM metric is not available in the table)
- Meta Ads: also uses a message/conversation counter
- AI Chat: every chat is treated like a DM, and the completed chats are counted when there is a closed timestamp
- Website and YouVersion: DMs are not available, so these are left empty

### Courses

Course data is collected from a shared event table called `analytics_learnnn_events_combined`.

For course data, the system looks for completed registration events and then tries to figure out which platform brought the user there.

Important notes:
- For Facebook and Instagram, the system looks for events where the source text contains `facebook` or `instagram`.
- For Website, the system assumes website-related course signups when the event source or medium contains one of these values:
  - `biblword`
  - `organic`
  - `website`

This is an assumption because the event table does not have a clean "came from website" flag. Instead, the code uses text matching in the event metadata.

## Where the data is extracted from

Each platform has a backend route in `app/api/analytics/*`.

Here is the general flow:
1. The dashboard requests platform data from one or more routes.
2. Each route queries a BigQuery table.
3. The route returns totals for the platform, comments, DMs, and course joins.
4. The frontend combines the returned values into the dashboard view.

### Example routes and tables

- Facebook: `app/api/analytics/facebook/route.ts`
  - uses `facebook_insights_combined_post_metrics`
  - uses `analytics_learnnn_events_combined`

- Instagram: `app/api/analytics/instagram/route.ts`
  - uses `instagram_insights_combined_post_metrics`
  - uses `instagram_insights_combined_follower_metrics_2`
  - uses `analytics_learnnn_events_combined`

- Google Ads: `app/api/analytics/google-ads/route.ts`
  - uses `google_ads_combined_conversions`

- Meta Ads: `app/api/analytics/meta-ads/route.ts`
  - uses `facebook_ads_combined_conversions`

- Website: `app/api/analytics/website/route.ts`
  - uses `analytics_biblword_articles_combined`
  - uses `analytics_learnnn_events_combined`

- YouVersion: `app/api/analytics/youversion/route.ts`
  - uses `youversion_combined_language_statistics`

- AI Chat: `app/api/analytics/ai-chat/route.ts`
  - uses `echo_chat_statistics_combined`
  - uses `analytics_learnnn_events_combined`

## Where assumptions were added

There are a few places where the dashboard does not have perfect data and must make a best guess:

- **Website course data**: The website route assumes registrations are from website traffic when the event source/media contains words like `website`, `organic`, or `biblword`.
- **Website comments**: The dashboard no longer assigns website traffic to the comments stage.
- **Instagram DMs**: Since the table does not include a direct DM count, the dashboard uses `Media_follows` as a proxy for message-style engagement.
- **Social Media filter**: The dashboard shows `Social Media` as one option in the filters, but it actually fetches Facebook and Instagram data behind the scenes.

## Why this matters

For non-technical users, the key ideas are:
- The dashboard is built from real analytics tables, but some platforms do not have every metric.
- When a direct metric is missing, the dashboard uses a close proxy or a text-based guess.
- `Social Media` is a friendly grouping, not a separate data source.
- `Courses` are usually taken from the shared registration events table, not from the platform-specific post tables.

## Simple summary by platform

### Facebook
- Content = post reach
- Comments = Facebook post comments
- DMs = ad conversations started
- Courses = registration events tagged as Facebook

### Instagram
- Content = Instagram post reach
- Comments = Instagram post comments
- DMs = follower activity used as a DM proxy
- Courses = registration events tagged as Instagram

### Website
- Content = website users and sessions
- Comments = not available
- Courses = registration events that look like website or organic traffic

### Google Ads
- Content = clicks and impressions
- Courses = ad conversions for registrations
- Comments/DMs = not available

### Meta Ads
- Content = ad reach and conversions
- DMs = ad message conversations
- Courses = conversions from one of several registration columns

### YouVersion
- Content = subscriptions
- Courses = completion counts
- Comments/DMs = not available

### AI Chat
- Content = chat conversations
- DMs = completed chats
- Courses = registration events tagged as echo/chat traffic

## What to remember

This document is meant to explain the project in plain language. If you want to make the data more accurate, the next step is to clean up the event source labels in `analytics_learnnn_events_combined` so website and social traffic are identified more clearly.
