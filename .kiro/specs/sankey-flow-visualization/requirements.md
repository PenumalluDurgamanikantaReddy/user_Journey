# Requirements Document: Sankey Flow Visualization

## Introduction

The Sankey Flow Visualization feature is an interactive multi-phase flow diagram that visualizes user journeys through the platform ecosystem. The system supports both 3-column and 4-column layouts with hierarchical expandable nodes, allowing users to drill down from high-level categories (Social Media, Ads) into individual platforms (Facebook, Instagram, Twitter, Google Ads, Meta Ads). The visualization displays user flows through Content Sources (Phase 1), Conversation Types (Phase 2), and Goals (Phase 3) using curved SVG bands with widths proportional to flow volumes. Every content box maintains connections with all conversation boxes to ensure complete visibility of user journey patterns. The system features a dark theme by default with light theme toggle, multi-select filters with tag-based UI, and smooth transitions for expand/collapse animations.

## Glossary

- **Sankey_Visualization**: The main React component that orchestrates data aggregation, layout calculation, and rendering
- **Flow_Band**: A curved SVG path representing user flow between two boxes, with width proportional to the number of users
- **Phase_Box**: A rectangular visual element representing a category (medium, conversation type, or goal) in one of the phases
- **Expandable_Box**: A Phase_Box that can be clicked to expand into individual child platforms
- **Data_Aggregator**: The module responsible for grouping users and calculating flow volumes with hierarchical support
- **Layout_Engine**: The module responsible for positioning boxes and routing bands with support for dynamic 3-column and 4-column layouts
- **Tooltip**: An interactive overlay displaying detailed metrics when hovering over a flow band
- **User**: A data entity containing medium, conversationType, goal, country, and other attributes
- **Flow_Volume**: The count of users following a specific path between two boxes
- **Theme_Provider**: The context provider managing dark/light theme state
- **Multi_Select_Filter**: A filter component supporting multiple value selection with tag-based display

## Requirements

### Requirement 1: Hierarchical Data Aggregation

**User Story:** As a data analyst, I want the system to aggregate user data with hierarchical grouping support, so that I can visualize user journey patterns at different levels of detail.

#### Acceptance Criteria

1. WHEN the Sankey_Visualization receives a list of users with no expansion, THE Data_Aggregator SHALL group users into high-level categories (Social Media, Ads, YouVersion, Website, AI, Daily Devotionals)
2. WHEN the Social Media category is expanded, THE Data_Aggregator SHALL group users into individual platforms (Facebook, Instagram, Twitter)
3. WHEN the Ads category is expanded, THE Data_Aggregator SHALL group users into individual platforms (Google Ads, Meta Ads)
4. WHEN the Sankey_Visualization receives a list of users, THE Data_Aggregator SHALL group users by conversationType for Phase 2 boxes
5. WHEN the Sankey_Visualization receives a list of users, THE Data_Aggregator SHALL group users by goal for Phase 3 boxes
6. WHEN calculating flows between phases, THE Data_Aggregator SHALL count users for each (source, destination) pair
7. WHEN a user has no conversationType, THE Data_Aggregator SHALL exclude that user from Phase 2 flows
8. THE Data_Aggregator SHALL calculate the total user count for each Phase_Box
9. THE Data_Aggregator SHALL calculate the percentage of total users for each Phase_Box
10. WHEN a category is expanded, THE Data_Aggregator SHALL ensure the sum of users in child platforms equals the total users in the parent category

### Requirement 2: Dynamic Layout Calculation

**User Story:** As a user, I want boxes and flow bands to be positioned clearly in either 3-column or 4-column layouts, so that I can easily read and understand the visualization at different levels of detail.

#### Acceptance Criteria

1. WHEN no category is expanded, THE Layout_Engine SHALL create a 3-column layout with Content, Conversation, and Goal phases
2. WHEN a category is expanded, THE Layout_Engine SHALL create a 4-column layout with expanded platforms, all content categories, conversation types, and goals
3. THE Layout_Engine SHALL position Phase 1 boxes in the leftmost column
4. WHEN in 4-column mode, THE Layout_Engine SHALL position all content categories in column 2 with "Content" heading
5. WHEN in 4-column mode, THE Layout_Engine SHALL position conversation types in column 3 with "Conversation" heading
6. WHEN in 4-column mode, THE Layout_Engine SHALL position goals in column 4 with "Goal" heading
7. WHEN positioning boxes vertically within a phase, THE Layout_Engine SHALL distribute them with MIN_VERTICAL_SPACING of 15 pixels
8. WHEN calculating box height, THE Layout_Engine SHALL make height proportional to the user count for that box
9. THE Layout_Engine SHALL ensure minimum box height of 80 pixels for readability
10. THE Layout_Engine SHALL ensure maximum box height of 300 pixels
11. THE Layout_Engine SHALL ensure box width of 180 pixels
12. THE Layout_Engine SHALL use PHASE_HORIZONTAL_SPACING of 250 pixels between columns
13. WHEN routing Flow_Bands between boxes, THE Layout_Engine SHALL calculate Bezier curve control points for smooth curves
14. THE Layout_Engine SHALL ensure canvas padding of 40 pixels on all sides

### Requirement 3: SVG Rendering with Clip Paths

**User Story:** As a user, I want the visualization to render clearly with smooth curves, appropriate colors, and no text overflow, so that I can distinguish different flows visually.

#### Acceptance Criteria

1. THE Sankey_Visualization SHALL render each Phase_Box as an SVG rectangle with rounded corners (8px radius)
2. WHEN rendering a Phase_Box, THE Sankey_Visualization SHALL apply a color from the COLOR_MAP based on the box category
3. WHEN rendering a Phase_Box, THE Sankey_Visualization SHALL create an SVG clip path definition for that box
4. WHEN rendering text inside a Phase_Box, THE Sankey_Visualization SHALL apply the clip path to prevent text overflow
5. WHEN rendering a Phase_Box, THE Sankey_Visualization SHALL display the box label as centered text
6. WHEN rendering a Phase_Box, THE Sankey_Visualization SHALL display the user count and percentage inside the box
7. WHEN rendering an Expandable_Box, THE Sankey_Visualization SHALL display a + or − icon outside the clip path
8. THE Sankey_Visualization SHALL render each Flow_Band as an SVG path using cubic Bezier curves
9. WHEN rendering a Flow_Band, THE Sankey_Visualization SHALL set the stroke width proportional to the flow volume with minimum of 2 pixels
10. WHEN rendering a Flow_Band, THE Sankey_Visualization SHALL apply semi-transparent color matching the source box (opacity 0.4)
11. THE Sankey_Visualization SHALL ensure Flow_Bands are rendered behind Phase_Boxes in z-order
12. THE Sankey_Visualization SHALL render phase labels above each column

### Requirement 4: Hierarchical Expansion Interaction

**User Story:** As a user, I want to click on Social Media or Ads boxes to expand them into individual platforms, so that I can see detailed breakdowns of user flows.

#### Acceptance Criteria

1. WHEN a user clicks on the Social Media box, THE Sankey_Visualization SHALL expand it to show Facebook, Instagram, and Twitter in a new leftmost column
2. WHEN a user clicks on the Ads box, THE Sankey_Visualization SHALL expand it to show Google Ads and Meta Ads in a new leftmost column
3. WHEN a category is expanded, THE Sankey_Visualization SHALL transition from 3-column to 4-column layout
4. WHEN a category is expanded, THE Sankey_Visualization SHALL display all content categories in column 2
5. WHEN an expanded category is clicked again, THE Sankey_Visualization SHALL collapse back to 3-column layout
6. WHEN expansion or collapse occurs, THE Sankey_Visualization SHALL apply a smooth 500ms transition
7. WHEN a transition is in progress, THE Sankey_Visualization SHALL prevent additional expansion clicks
8. WHEN a transition is in progress, THE Sankey_Visualization SHALL reduce band opacity to 0.3
9. WHEN rendering an expandable box, THE Sankey_Visualization SHALL display a + icon
10. WHEN rendering an expanded box, THE Sankey_Visualization SHALL display a − icon
11. THE Sankey_Visualization SHALL normalize category names to lowercase with hyphens for expansion state tracking

### Requirement 5: Interactive Tooltips

**User Story:** As a user, I want to see detailed flow metrics when hovering over bands, so that I can understand specific user journey patterns.

#### Acceptance Criteria

1. WHEN a user hovers over a Flow_Band, THE Sankey_Visualization SHALL display a Tooltip
2. WHEN displaying a Tooltip, THE Sankey_Visualization SHALL show the source box label
3. WHEN displaying a Tooltip, THE Sankey_Visualization SHALL show the destination box label
4. WHEN displaying a Tooltip, THE Sankey_Visualization SHALL show the flow volume (user count)
5. WHEN displaying a Tooltip, THE Sankey_Visualization SHALL show the percentage of total users in that flow
6. WHEN displaying a Tooltip, THE Sankey_Visualization SHALL position it near the mouse cursor at (mouseX + 10, mouseY + 10)
7. WHEN a user moves the mouse away from a Flow_Band, THE Sankey_Visualization SHALL hide the Tooltip
8. THE Tooltip SHALL have a dark background with white text for readability

### Requirement 6: Visual Feedback

**User Story:** As a user, I want visual feedback when interacting with the visualization, so that I know which elements are interactive.

#### Acceptance Criteria

1. WHEN a user hovers over a Flow_Band, THE Sankey_Visualization SHALL increase the band opacity to 0.8
2. WHEN a user hovers over a Flow_Band, THE Sankey_Visualization SHALL apply a subtle shadow effect
3. WHEN a user hovers over a Phase_Box, THE Sankey_Visualization SHALL apply a scale transform to enlarge the box slightly
4. WHEN a user hovers over a Phase_Box, THE Sankey_Visualization SHALL increase the box shadow intensity
5. WHEN a user hovers over an Expandable_Box, THE Sankey_Visualization SHALL change the cursor to pointer
6. THE Sankey_Visualization SHALL apply smooth CSS transitions (300ms) to all hover effects

### Requirement 7: Dark Theme with Toggle

**User Story:** As a user, I want a dark theme by default with the ability to toggle to light theme, so that I can view the visualization in my preferred color scheme.

#### Acceptance Criteria

1. THE Theme_Provider SHALL default to dark theme on initial load
2. THE Theme_Provider SHALL provide a toggleTheme function accessible to all components
3. WHEN the theme toggle button is clicked, THE Theme_Provider SHALL switch between dark and light themes
4. WHEN the theme changes, THE Theme_Provider SHALL apply the new theme class to the document root
5. WHEN in dark theme, THE Sankey_Visualization SHALL use dark backgrounds (#1a1f2e, #2d3548)
6. WHEN in light theme, THE Sankey_Visualization SHALL use light backgrounds (white, light gray)
7. THE Theme_Provider SHALL apply smooth 300ms transitions when switching themes
8. THE theme toggle button SHALL be positioned in the top-right corner of the interface
9. THE theme toggle button SHALL display an appropriate icon for the current theme state
10. WHEN the theme changes, ALL components SHALL update their styles within 300ms

### Requirement 8: Multi-Select Filters

**User Story:** As a user, I want to select multiple values for Country, Brand/Content, and Conversation filters, so that I can analyze specific user segments.

#### Acceptance Criteria

1. THE Filters component SHALL provide a multi-select dropdown for Country filter
2. THE Filters component SHALL provide a multi-select dropdown for Brand/Content filter with grouped options
3. THE Filters component SHALL provide a multi-select dropdown for Conversation filter
4. WHEN a user selects a country, THE Filters component SHALL display it as a blue tag with × button
5. WHEN a user selects a brand or content source, THE Filters component SHALL display it as a purple tag with × button
6. WHEN a user selects a conversation type, THE Filters component SHALL display it as a green tag with × button
7. WHEN a user clicks the × button on a tag, THE Filters component SHALL remove that value from the filter
8. THE Brand/Content filter SHALL group options into "Brands" and "Content Sources" sections
9. THE multi-select dropdowns SHALL display a dropdown arrow indicator
10. THE multi-select dropdowns SHALL support scrolling when options exceed visible area
11. THE multi-select dropdowns SHALL highlight selected options
12. THE multi-select dropdowns SHALL show hover effects on options

### Requirement 9: Single-Select Filters

**User Story:** As a user, I want to select single values for Language and Phase filters, so that I can narrow down the data displayed.

#### Acceptance Criteria

1. THE Filters component SHALL provide a single-select dropdown for Language filter
2. THE Filters component SHALL provide a single-select dropdown for Phase filter
3. THE Phase filter SHALL include options: Evangelism, Discipleship, Leadership
4. THE single-select dropdowns SHALL display a dropdown arrow indicator
5. THE single-select dropdowns SHALL highlight the selected option
6. WHEN a user selects a new value, THE Filters component SHALL replace the previous selection

### Requirement 10: Filter UI Design

**User Story:** As a user, I want a compact horizontal filter layout, so that filters don't take up excessive screen space.

#### Acceptance Criteria

1. THE Filters component SHALL display all filters in a single horizontal row
2. THE Filters component SHALL use font size xs (12px) for filter labels and options
3. THE Filters component SHALL use dark theme backgrounds for dropdown menus
4. THE Filters component SHALL apply custom scrollbar styling to dropdown option lists
5. THE Filters component SHALL provide a Reset button at the end of the filter row
6. WHEN the Reset button is clicked, THE Filters component SHALL clear all filters except date range
7. THE Reset button SHALL have a gradient background (red/orange)
8. THE Reset button SHALL display an icon and text label
9. THE Filters component SHALL ensure minimal height for compact appearance
10. THE Filters component SHALL apply hover effects to dropdown options

### Requirement 11: Updated Data Types

**User Story:** As a developer, I want the system to support the correct medium, conversation, and goal types, so that the data model matches the current platform structure.

#### Acceptance Criteria

1. THE system SHALL support the following medium types: facebook, instagram, twitter, google-ads, meta-ads, youversion, website, ai, daily-devotionals
2. THE system SHALL NOT support 'courses' as a medium type
3. THE system SHALL support the following conversation types: comments, dm, courses
4. THE system SHALL NOT support 'chat' as a conversation type
5. THE system SHALL support only 'church' as a goal type
6. THE system SHALL NOT support 'conversation' as a goal type
7. THE User data model SHALL include a country field
8. THE system SHALL validate that all users have a valid medium from the supported list
9. THE system SHALL validate that all users with conversationType have a valid type from the supported list
10. THE system SHALL validate that all users have goal set to 'church'

### Requirement 12: Updated Color Scheme

**User Story:** As a user, I want consistent colors for related categories, so that I can visually understand the relationships between content sources.

#### Acceptance Criteria

1. THE Sankey_Visualization SHALL use blue (#3b82f6) for Facebook boxes
2. THE Sankey_Visualization SHALL use pink (#ec4899) for Instagram boxes
3. THE Sankey_Visualization SHALL use blue (#1da1f2) for Twitter boxes
4. THE Sankey_Visualization SHALL use blue (#4285f4) for Google Ads boxes
5. THE Sankey_Visualization SHALL use blue (#0668e1) for Meta Ads boxes
6. THE Sankey_Visualization SHALL use purple (#8b5cf6) for YouVersion boxes
7. THE Sankey_Visualization SHALL use green (#10b981) for Website boxes
8. THE Sankey_Visualization SHALL use cyan (#06b6d4) for AI boxes
9. THE Sankey_Visualization SHALL use red (#ef4444) for Daily Devotionals boxes
10. THE Sankey_Visualization SHALL use blue (#3b82f6) for Social Media category boxes
11. THE Sankey_Visualization SHALL use orange (#f59e0b) for Ads category boxes
12. THE Sankey_Visualization SHALL use blue (#60a5fa) for Comments boxes
13. THE Sankey_Visualization SHALL use purple (#a78bfa) for DM boxes
14. THE Sankey_Visualization SHALL use red (#ef4444) for Courses boxes
15. THE Sankey_Visualization SHALL use green (#34d399) for Church goal boxes

### Requirement 13: Empty State Handling

**User Story:** As a user, I want clear feedback when no data is available, so that I understand why the visualization is not displayed.

#### Acceptance Criteria

1. WHEN the Sankey_Visualization receives an empty user list, THE Sankey_Visualization SHALL display an empty state message
2. WHEN displaying an empty state, THE Sankey_Visualization SHALL show the text "No data available for the selected filters"
3. WHEN a Phase_Box would have zero users, THE Layout_Engine SHALL exclude that box from the layout
4. WHEN a Flow_Band would have zero volume, THE Sankey_Visualization SHALL not render that band

### Requirement 14: Performance Optimization

**User Story:** As a developer, I want the visualization to render efficiently with large datasets, so that the user experience remains smooth.

#### Acceptance Criteria

1. THE Data_Aggregator SHALL use hash maps for O(1) lookup when grouping users
2. THE Layout_Engine SHALL calculate all positions in a single pass through the data
3. THE Sankey_Visualization SHALL use React.memo to prevent unnecessary re-renders
4. THE Sankey_Visualization SHALL debounce hover events to reduce tooltip update frequency
5. WHEN rendering more than 50 Flow_Bands, THE Sankey_Visualization SHALL apply path simplification to reduce SVG complexity
6. WHEN expansion transitions occur, THE Sankey_Visualization SHALL complete all animations within 500ms

### Requirement 15: Responsive Design

**User Story:** As a user, I want the visualization to adapt to different screen sizes, so that I can view it on various devices.

#### Acceptance Criteria

1. THE Sankey_Visualization SHALL use an SVG viewBox for scalable rendering
2. WHEN the viewport width is less than 768 pixels, THE Sankey_Visualization SHALL reduce horizontal spacing between phases
3. WHEN the viewport width is less than 768 pixels, THE Sankey_Visualization SHALL reduce font sizes for labels
4. THE Sankey_Visualization SHALL maintain aspect ratio when scaling
5. THE Sankey_Visualization SHALL ensure minimum canvas width of 600 pixels

### Requirement 16: Complete Flow Connectivity

**User Story:** As a data analyst, I want every content box to have connections with all conversation boxes, so that I can see the complete user journey patterns across all channels.

#### Acceptance Criteria

1. WHEN the Sankey_Visualization renders flows, EVERY content source box (Facebook, Instagram, Twitter, Google Ads, Meta Ads, YouVersion, Website, AI Chat, Daily Devotionals) SHALL have at least one flow connection to EACH conversation type box (Comments, DM, Courses)
2. THE mock data SHALL include users for every (medium, conversationType) combination
3. WHEN a content box is displayed, THE Sankey_Visualization SHALL render flow bands to all three conversation boxes
4. THE Data_Aggregator SHALL ensure that filtering does not break the complete connectivity requirement when sufficient data exists
5. WHEN in expanded view (4-column layout), EVERY individual platform box SHALL have connections to all conversation boxes

### Requirement 17: Accessibility

**User Story:** As a user with accessibility needs, I want the visualization to be perceivable and operable, so that I can access the information.

#### Acceptance Criteria

1. THE Sankey_Visualization SHALL provide ARIA labels for all Phase_Boxes
2. THE Sankey_Visualization SHALL provide ARIA labels for all Flow_Bands
3. WHEN a Phase_Box receives keyboard focus, THE Sankey_Visualization SHALL display a focus outline
4. THE Sankey_Visualization SHALL ensure color contrast ratios meet WCAG AA standards
5. THE Sankey_Visualization SHALL provide a text-based data table as an alternative view
6. WHEN an Expandable_Box is focused, THE Sankey_Visualization SHALL allow keyboard activation (Enter/Space)
