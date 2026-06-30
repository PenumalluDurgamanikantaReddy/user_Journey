# Platform and Brand Filters Documentation

This document explains the architecture, state management, and data flow for the **Platform** (Content Source) and **Brand** filters within the GlobalRize analytics dashboard.

## 1. UI Components (`app/components/Filters.tsx`)
The user interface provides checkbox-based filters for both Platforms (labeled "Content" in the UI) and Brands.

- **Platform Filters**: Selectable from an array of predefined sources (e.g., Facebook, Instagram, Google Ads, Website, AI, etc.). Checking or unchecking these updates the `contentSources` array within the shared filter state.
- **Brand Filters**: Selectable from an array of predefined brands (e.g., Biblword, SheRises, AlKitab, Search4Truth). Checking or unchecking these updates the `brands` array within the shared filter state.

## 2. State Management (`app/page.tsx`)
The filter selections are centrally managed in the main page component using React state (`filters`). 

- **Platform/ContentSources**: The array of selected platforms is passed directly to the data-fetching hook as `contentSources`.
- **Brands**: Currently, the dashboard is configured to extract a specific brand if exactly one is selected:
  ```typescript
  brand: filters.brands.length === 1 ? filters.brands[0] : undefined
  ```
  This single `brand` string is then passed down to the analytics hook.

## 3. Data Fetching (`app/hooks/useAnalyticsData.ts`)
The `useAnalyticsData` custom hook serves as the orchestrator between the UI state and the backend APIs.

### Platform Filtering (Request Routing)
- The hook knows about all available platform API endpoints (e.g., `/api/analytics/facebook`, `/api/analytics/instagram`).
- It checks the `filters.contentSources` array to determine which API calls to make.
- **If specific platforms are selected**: It conditionally fires `fetch()` requests *only* to the endpoints of the selected platforms.
- **If no platforms are selected (empty array)**: It defaults to firing requests to *all* available platforms simultaneously.
- The results from the triggered APIs are then aggregated into a single `platforms` array and a `grandTotal`.

### Brand Filtering (Query Parameters)
- If a `brand` string is provided in the hook's arguments, it is automatically appended as a URL query parameter (`?brand=...`) to every outgoing platform API request.

## 4. Backend APIs (e.g., `app/api/analytics/.../route.ts`)
The Next.js API routes receive the requests and dynamically construct BigQuery SQL statements.

- **Brand Filter Execution**: The API extracts the `brand` query parameter from the request URL. It then adds a parameterized SQL condition to filter the database rows. For example, in the website analytics route, it constructs a string match:
  ```sql
  AND LOWER(Platform) LIKE LOWER(CONCAT('%', @brand, '%'))
  ```
  *(Note: In certain BigQuery tables like `analytics_biblword_articles_combined`, the `Platform` column actually contains the Brand name, such as "Biblword".)*
- **Platform Filter Execution**: The API routes do not need to explicitly filter by platform in their SQL queries. The platform filtering is natively achieved by the `useAnalyticsData` hook deciding which specific API routes (and therefore which specific BigQuery tables) to query in the first place.

## Summary Flowchart
1. **User toggles a Platform** ➔ `contentSources` array updates ➔ `useAnalyticsData` hook conditionally fires requests *only* to those selected platform APIs.
2. **User toggles a Brand** ➔ `brands` array updates (if one is selected, it is passed as a query param) ➔ API endpoints append a SQL `LIKE` clause to filter the BigQuery results by the requested brand.
