# Requirements Document: Sankey Flow Visualization

## Introduction

The Sankey Flow Visualization feature transforms the current static box-based user journey visualization into an interactive three-phase flow diagram. The system displays user flows through Content Sources (Phase 1), Conversation Types (Phase 2), and Goals (Phase 3) using curved SVG bands with widths proportional to flow volumes. The visualization provides intuitive representation of user journey patterns, conversion rates, and drop-off points with interactive tooltips showing detailed metrics.

## Glossary

- **Sankey_Visualization**: The main React component that orchestrates data aggregation, layout calculation, and rendering
- **Flow_Band**: A curved SVG path representing user flow between two boxes, with width proportional to the number of users
- **Phase_Box**: A rectangular visual element representing a category (medium, conversation type, or goal) in one of the three phases
- **Data_Aggregator**: The module responsible for grouping users and calculating flow volumes
- **Layout_Engine**: The module responsible for positioning boxes and routing bands with collision detection
- **Tooltip**: An interactive overlay displaying detailed metrics when hovering over a flow band
- **User**: A data entity containing medium, conversationType, goal, and other attributes
- **Flow_Volume**: The count of users following a specific path between two boxes

## Requirements

### Requirement 1: Data Aggregation

**User Story:** As a data analyst, I want the system to aggregate user data into flows, so that I can visualize user journey patterns across phases.

#### Acceptance Criteria

1. WHEN the Sankey_Visualization receives a list of users, THE Data_Aggregator SHALL group users by medium for Phase 1 boxes
2. WHEN the Sankey_Visualization receives a list of users, THE Data_Aggregator SHALL group users by conversationType for Phase 2 boxes
3. WHEN the Sankey_Visualization receives a list of users, THE Data_Aggregator SHALL group users by goal for Phase 3 boxes
4. WHEN calculating flows between Phase 1 and Phase 2, THE Data_Aggregator SHALL count users for each (medium, conversationType) pair
5. WHEN calculating flows between Phase 2 and Phase 3, THE Data_Aggregator SHALL count users for each (conversationType, goal) pair
6. WHEN a user has no conversationType, THE Data_Aggregator SHALL exclude that user from Phase 2 flows
7. THE Data_Aggregator SHALL calculate the total user count for each Phase_Box
8. THE Data_Aggregator SHALL calculate the percentage of total users for each Phase_Box

### Requirement 2: Layout Calculation

**User Story:** As a user, I want boxes and flow bands to be positioned clearly without overlaps, so that I can easily read and understand the visualization.

#### Acceptance Criteria

1. THE Layout_Engine SHALL position Phase 1 boxes in a vertical column on the left side of the canvas
2. THE Layout_Engine SHALL position Phase 2 boxes in a vertical column in the center of the canvas
3. THE Layout_Engine SHALL position Phase 3 boxes in a vertical column on the right side of the canvas
4. WHEN positioning boxes vertically within a phase, THE Layout_Engine SHALL distribute them with equal spacing
5. WHEN calculating box height, THE Layout_Engine SHALL make height proportional to the user count for that box
6. THE Layout_Engine SHALL ensure minimum box height of 40 pixels for readability
7. THE Layout_Engine SHALL ensure minimum vertical spacing of 20 pixels between boxes
8. WHEN routing Flow_Bands between boxes, THE Layout_Engine SHALL detect potential collisions with other bands
9. WHEN a collision is detected, THE Layout_Engine SHALL adjust band vertical offset to prevent overlap
10. THE Layout_Engine SHALL calculate Bezier curve control points for smooth band curves

### Requirement 3: SVG Rendering

**User Story:** As a user, I want the visualization to render clearly with smooth curves and appropriate colors, so that I can distinguish different flows visually.

#### Acceptance Criteria

1. THE Sankey_Visualization SHALL render each Phase_Box as an SVG rectangle
2. WHEN rendering a Phase_Box, THE Sankey_Visualization SHALL apply a color gradient based on the box category
3. WHEN rendering a Phase_Box, THE Sankey_Visualization SHALL display the box label as centered text
4. WHEN rendering a Phase_Box, THE Sankey_Visualization SHALL display the user count and percentage inside the box
5. THE Sankey_Visualization SHALL render each Flow_Band as an SVG path using cubic Bezier curves
6. WHEN rendering a Flow_Band, THE Sankey_Visualization SHALL set the stroke width proportional to the flow volume
7. WHEN rendering a Flow_Band, THE Sankey_Visualization SHALL apply semi-transparent color matching the source box
8. THE Sankey_Visualization SHALL ensure Flow_Bands are rendered behind Phase_Boxes in z-order
9. THE Sankey_Visualization SHALL render phase labels ("Content", "Conversation", "Goal") above each column

### Requirement 4: Interactive Tooltips

**User Story:** As a user, I want to see detailed flow metrics when hovering over bands, so that I can understand specific user journey patterns.

#### Acceptance Criteria

1. WHEN a user hovers over a Flow_Band, THE Sankey_Visualization SHALL display a Tooltip
2. WHEN displaying a Tooltip, THE Sankey_Visualization SHALL show the source box label
3. WHEN displaying a Tooltip, THE Sankey_Visualization SHALL show the destination box label
4. WHEN displaying a Tooltip, THE Sankey_Visualization SHALL show the flow volume (user count)
5. WHEN displaying a Tooltip, THE Sankey_Visualization SHALL show the percentage of total users in that flow
6. WHEN displaying a Tooltip, THE Sankey_Visualization SHALL position it near the mouse cursor
7. WHEN a user moves the mouse away from a Flow_Band, THE Sankey_Visualization SHALL hide the Tooltip
8. THE Tooltip SHALL have a dark background with white text for readability

### Requirement 5: Visual Feedback

**User Story:** As a user, I want visual feedback when interacting with the visualization, so that I know which elements are interactive.

#### Acceptance Criteria

1. WHEN a user hovers over a Flow_Band, THE Sankey_Visualization SHALL increase the band opacity
2. WHEN a user hovers over a Flow_Band, THE Sankey_Visualization SHALL apply a subtle shadow effect
3. WHEN a user hovers over a Phase_Box, THE Sankey_Visualization SHALL apply a scale transform to enlarge the box slightly
4. WHEN a user hovers over a Phase_Box, THE Sankey_Visualization SHALL increase the box shadow intensity
5. THE Sankey_Visualization SHALL apply smooth CSS transitions to all hover effects

### Requirement 6: Empty State Handling

**User Story:** As a user, I want clear feedback when no data is available, so that I understand why the visualization is not displayed.

#### Acceptance Criteria

1. WHEN the Sankey_Visualization receives an empty user list, THE Sankey_Visualization SHALL display an empty state message
2. WHEN displaying an empty state, THE Sankey_Visualization SHALL show the text "No data available for the selected filters"
3. WHEN a Phase_Box would have zero users, THE Layout_Engine SHALL exclude that box from the layout
4. WHEN a Flow_Band would have zero volume, THE Sankey_Visualization SHALL not render that band

### Requirement 7: Responsive Design

**User Story:** As a user, I want the visualization to adapt to different screen sizes, so that I can view it on various devices.

#### Acceptance Criteria

1. THE Sankey_Visualization SHALL use an SVG viewBox for scalable rendering
2. WHEN the viewport width is less than 768 pixels, THE Sankey_Visualization SHALL reduce horizontal spacing between phases
3. WHEN the viewport width is less than 768 pixels, THE Sankey_Visualization SHALL reduce font sizes for labels
4. THE Sankey_Visualization SHALL maintain aspect ratio when scaling
5. THE Sankey_Visualization SHALL ensure minimum canvas width of 600 pixels

### Requirement 8: Performance Optimization

**User Story:** As a developer, I want the visualization to render efficiently with large datasets, so that the user experience remains smooth.

#### Acceptance Criteria

1. THE Data_Aggregator SHALL use hash maps for O(1) lookup when grouping users
2. THE Layout_Engine SHALL calculate all positions in a single pass through the data
3. THE Sankey_Visualization SHALL use React.memo to prevent unnecessary re-renders
4. THE Sankey_Visualization SHALL debounce hover events to reduce tooltip update frequency
5. WHEN rendering more than 50 Flow_Bands, THE Sankey_Visualization SHALL apply path simplification to reduce SVG complexity

### Requirement 9: Accessibility

**User Story:** As a user with accessibility needs, I want the visualization to be perceivable and operable, so that I can access the information.

#### Acceptance Criteria

1. THE Sankey_Visualization SHALL provide ARIA labels for all Phase_Boxes
2. THE Sankey_Visualization SHALL provide ARIA labels for all Flow_Bands
3. WHEN a Phase_Box receives keyboard focus, THE Sankey_Visualization SHALL display a focus outline
4. THE Sankey_Visualization SHALL ensure color contrast ratios meet WCAG AA standards
5. THE Sankey_Visualization SHALL provide a text-based data table as an alternative view

### Requirement 10: Color Scheme

**User Story:** As a user, I want consistent and meaningful colors, so that I can quickly identify different categories.

#### Acceptance Criteria

1. THE Sankey_Visualization SHALL use blue gradient for Facebook medium boxes
2. THE Sankey_Visualization SHALL use pink gradient for Instagram medium boxes
3. THE Sankey_Visualization SHALL use yellow gradient for Ads medium boxes
4. THE Sankey_Visualization SHALL use purple gradient for YouVersion medium boxes
5. THE Sankey_Visualization SHALL use green gradient for Website medium boxes
6. THE Sankey_Visualization SHALL use cyan gradient for AI medium boxes
7. THE Sankey_Visualization SHALL use red gradient for Courses medium boxes
8. THE Sankey_Visualization SHALL use distinct colors for conversation type boxes
9. THE Sankey_Visualization SHALL use orange gradient for Conversation goal boxes
10. THE Sankey_Visualization SHALL use green gradient for Church goal boxes
