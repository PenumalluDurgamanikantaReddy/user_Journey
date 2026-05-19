# Implementation Plan: Sankey Flow Visualization

## Overview

This implementation plan transforms the current box-based bubble visualization into an interactive Sankey diagram with hierarchical expandable nodes supporting both 3-column and 4-column layouts. The implementation uses TypeScript with React, SVG for rendering curved flow bands with clip paths to prevent text overflow, dark theme with toggle capability, multi-select filters with tag-based UI, and follows the existing codebase patterns. The plan includes data aggregation with hierarchical support, dynamic layout calculation, SVG rendering with clip paths, interactive tooltips, theme system, filter system, and comprehensive testing for correctness properties.

## Tasks

- [x] 1. Set up core data structures and types
  - Create TypeScript interfaces for FlowData, PhaseBox, FlowBand, and LayoutData
  - Define types for aggregated flows between phases
  - Create color mapping constants for all categories (Social Media uses blue #3b82f6, Ads uses orange #f59e0b)
  - Update medium types (removed 'courses', added google-ads, meta-ads, ai, daily-devotionals)
  - Update conversation types (removed 'chat', kept comments/dm/courses)
  - Update goal types (only 'church' goal remains)
  - Add country field to User data model
  - _Requirements: 1.1, 1.2, 1.3, 11.1-11.10, 12.1-12.14_

- [x] 2. Implement hierarchical data aggregation module
  - [x] 2.1 Create DataAggregator utility functions with hierarchical support
    - Implement groupUsersByMedium() with expandedCategory parameter
    - Support Social Media expansion (Facebook, Instagram, Twitter)
    - Support Ads expansion (Google Ads, Meta Ads)
    - Implement groupUsersByConversationType() to aggregate Phase 2 boxes
    - Implement groupUsersByGoal() to aggregate Phase 3 boxes (only Church)
    - Calculate user counts and percentages for each box
    - Mark Social Media and Ads as expandable with children arrays
    - _Requirements: 1.1, 1.2, 1.3, 1.7, 1.8, 1.10_
  
  - [ ]* 2.2 Write property test for hierarchical grouping correctness
    - **Property 1: Hierarchical Grouping Correctness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.10**
  
  - [ ]* 2.3 Write property test for user grouping completeness
    - **Property 2: User Grouping Completeness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.7**
  
  - [ ]* 2.4 Write property test for percentage calculation
    - **Property 8: Percentage Calculation Correctness**
    - **Validates: Requirements 1.8**
  
  - [x] 2.5 Create flow calculation functions
    - Implement calculateFlowsBetweenPhases() for Phase 1→2 and Phase 2→3
    - Count users for each (source, destination) pair
    - Handle users with undefined conversationType
    - _Requirements: 1.4, 1.5, 1.6_
  
  - [ ]* 2.6 Write property test for flow count accuracy
    - **Property 5: Flow Count Accuracy**
    - **Validates: Requirements 1.4, 1.5, 1.6**

- [x] 3. Checkpoint - Verify data aggregation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement dynamic layout engine module
  - [x] 4.1 Create box positioning functions with dynamic column support
    - Implement positionPhaseBoxes() to calculate x,y coordinates for all boxes
    - Support 3-column layout (Content | Conversation | Goal)
    - Support 4-column layout (Expanded Platforms | All Content | Conversation | Goal)
    - Calculate box heights proportional to user counts with MIN_BOX_HEIGHT of 80px
    - Calculate box heights with MAX_BOX_HEIGHT of 300px
    - Distribute boxes vertically with MIN_VERTICAL_SPACING of 15px
    - Use PHASE_HORIZONTAL_SPACING of 250px between columns
    - Use BOX_WIDTH of 180px
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.11, 2.12_
  
  - [ ]* 4.2 Write property test for dynamic column layout correctness
    - **Property 9: Dynamic Column Layout Correctness**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ]* 4.3 Write property test for phase column positioning
    - **Property 10: Phase Column Positioning**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  
  - [ ]* 4.4 Write property test for vertical spacing uniformity
    - **Property 11: Vertical Spacing Uniformity**
    - **Validates: Requirements 2.4**
  
  - [ ]* 4.5 Write property test for box height proportionality
    - **Property 12: Box Height Proportionality**
    - **Validates: Requirements 2.5, 2.6**
  
  - [x] 4.6 Create band routing functions
    - Implement routeFlowBands() to calculate band paths between boxes
    - Calculate Bezier curve control points for smooth curves
    - Support routing for both 3-column and 4-column layouts
    - _Requirements: 2.8, 2.10, 2.13_
  
  - [ ]* 4.7 Write property test for valid Bezier control points
    - **Property 14: Valid Bezier Control Points**
    - **Validates: Requirements 2.10**

- [x] 5. Checkpoint - Verify layout calculations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement SVG rendering components with clip paths
  - [x] 6.1 Create PhaseBox SVG component with clip path support
    - Render SVG rectangle with rounded corners (8px radius)
    - Create SVG clip path definition for each box
    - Apply clip path to text elements to prevent overflow
    - Display centered label text (clipped)
    - Display user count and percentage inside box (clipped)
    - Apply colors from COLOR_MAP based on category
    - Render expand/collapse icons OUTSIDE clip path
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  
  - [ ]* 6.2 Write property test for SVG clip path effectiveness
    - **Property 15: SVG Clip Path Effectiveness**
    - **Validates: Requirements 3.3, 3.4, 3.5_
  
  - [ ]* 6.3 Write property test for expand icon visibility
    - **Property 16: Expand Icon Visibility**
    - **Validates: Requirements 3.7**
  
  - [ ]* 6.4 Write property test for SVG element completeness
    - **Property 17: SVG Element Completeness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
  
  - [x] 6.5 Create FlowBand SVG component
    - Render SVG path using cubic Bezier curves
    - Set stroke width proportional to flow volume (minimum 2px)
    - Apply semi-transparent color matching source box (opacity 0.4)
    - Increase opacity to 0.8 on hover
    - Ensure bands render behind boxes (z-order)
    - _Requirements: 3.8, 3.9, 3.10, 3.11_
  
  - [ ]* 6.6 Write property test for band stroke width proportionality
    - **Property 18: Band Stroke Width Proportionality**
    - **Validates: Requirements 3.9**
  
  - [ ]* 6.7 Write property test for color inheritance and transparency
    - **Property 20: Color Inheritance and Transparency**
    - **Validates: Requirements 3.10**
  
  - [ ]* 6.8 Write property test for z-order correctness
    - **Property 21: Z-Order Correctness**
    - **Validates: Requirements 3.11**
  
  - [x] 6.9 Create phase label renderer
    - Render phase labels above each column
    - Support dynamic labels based on expansion state
    - Show expanded category name in column 1 when expanded
    - Show "Content", "Conversation", "Goal" labels in other columns
    - _Requirements: 3.12_

- [x] 7. Implement hierarchical expansion interaction
  - [x] 7.1 Create expansion click handler
    - Handle clicks on expandable boxes (Social Media, Ads)
    - Toggle expandedCategory state
    - Normalize category names (lowercase, spaces to hyphens)
    - Prevent clicks during transitions (isTransitioning check)
    - _Requirements: 4.1, 4.2, 4.7, 4.11_
  
  - [x] 7.2 Implement smooth transitions
    - Apply 500ms CSS transitions for expand/collapse
    - Set isTransitioning flag during animation
    - Reduce band opacity to 0.3 during transitions
    - Restore normal opacity after transition completes
    - _Requirements: 4.6, 4.8, 4.9_
  
  - [x] 7.3 Add expand/collapse UI indicators
    - Display + icon on expandable boxes
    - Display − icon on expanded boxes
    - Position icons outside clip path for visibility
    - _Requirements: 4.9, 4.10_
  
  - [ ]* 7.4 Write property test for expansion state consistency
    - **Property 3: Expansion State Consistency**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
  
  - [ ]* 7.5 Write property test for transition state management
    - **Property 4: Transition State Management**
    - **Validates: Requirements 4.6, 4.7, 4.8**

- [x] 8. Implement interactive tooltip system
  - [x] 8.1 Create Tooltip component
    - Display source label, destination label, flow volume, and percentage
    - Position tooltip near mouse cursor at (mouseX + 10, mouseY + 10)
    - Apply dark background with white text
    - Apply LABEL_MAP for display labels
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.8_
  
  - [ ]* 8.2 Write property test for tooltip content completeness
    - **Property 22: Tooltip Content Completeness**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
  
  - [ ]* 8.3 Write property test for tooltip positioning
    - **Property 23: Tooltip Positioning**
    - **Validates: Requirements 5.6**
  
  - [x] 8.4 Implement hover event handlers
    - Add onMouseEnter and onMouseLeave handlers to FlowBand components
    - Add onMouseMove handler to update tooltip position
    - Track hovered band state
    - _Requirements: 5.1, 5.7_

- [x] 9. Checkpoint - Verify interactivity
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement visual feedback and hover effects
  - [x] 10.1 Add hover effects to FlowBand components
    - Increase band opacity to 0.8 on hover
    - Add smooth CSS transitions (300ms)
    - Change cursor to pointer
    - _Requirements: 6.1, 6.2, 6.5, 6.6_
  
  - [x] 10.2 Add hover effects to PhaseBox components
    - Apply opacity change on hover (0.9)
    - Add drop shadow effect on hover
    - Add smooth CSS transitions (300ms)
    - Change cursor to pointer for expandable boxes
    - _Requirements: 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 10.3 Write property test for hover state transitions
    - **Property 24: Hover State Transitions**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.6**

- [x] 11. Implement dark theme with toggle
  - [x] 11.1 Create ThemeProvider context
    - Implement ThemeContext with theme state ('dark' | 'light')
    - Provide toggleTheme function
    - Default to dark theme on initial load
    - Apply theme class to document root
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [x] 11.2 Create ThemeToggle component
    - Position toggle button in top-right corner
    - Display appropriate icon for current theme (sun/moon)
    - Handle click to toggle theme
    - _Requirements: 7.8, 7.9_
  
  - [x] 11.3 Apply theme styles to SankeyVisualization
    - Use dark backgrounds (#1a1f2e, #2d3548) in dark theme
    - Use light backgrounds (white, light gray) in light theme
    - Apply smooth 300ms transitions when switching themes
    - Update all component styles with theme-aware classes
    - _Requirements: 7.5, 7.6, 7.7, 7.10_
  
  - [ ]* 11.4 Write property test for theme application completeness
    - **Property 7: Theme Application Completeness**
    - **Validates: Requirements 7.4, 7.10**
  
  - [ ]* 11.5 Write property test for theme toggle responsiveness
    - **Property 28: Theme Toggle Responsiveness**
    - **Validates: Requirements 7.2, 7.3, 7.10**

- [x] 12. Implement multi-select filters with tag-based UI
  - [x] 12.1 Create multi-select Country filter
    - Implement dropdown with all countries
    - Display selected countries as blue tags with × buttons
    - Handle tag removal on × click
    - Apply dropdown arrow indicator
    - _Requirements: 8.1, 8.4, 8.7, 8.9_
  
  - [x] 12.2 Create multi-select Brand/Content filter
    - Implement dropdown with grouped options (Brands | Content Sources)
    - Display selected items as purple tags with × buttons
    - Handle tag removal on × click
    - Support both brand names and content source mediums
    - Apply dropdown arrow indicator
    - _Requirements: 8.2, 8.5, 8.7, 8.8, 8.9_
  
  - [x] 12.3 Create multi-select Conversation filter
    - Implement dropdown with conversation types
    - Display selected types as green tags with × buttons
    - Handle tag removal on × click
    - Apply dropdown arrow indicator
    - _Requirements: 8.3, 8.6, 8.7, 8.9_
  
  - [x] 12.4 Apply compact horizontal filter layout
    - Display all filters in single horizontal row
    - Use font size xs (12px) for labels and options
    - Apply dark theme backgrounds for dropdowns
    - Add custom scrollbar styling
    - Ensure minimal height for compact appearance
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.9_
  
  - [x] 12.5 Add Reset button
    - Position at end of filter row
    - Apply gradient background (red/orange)
    - Clear all filters except date range on click
    - Display icon and text label
    - _Requirements: 10.5, 10.6, 10.7, 10.8_
  
  - [ ]* 12.6 Write property test for multi-select filter consistency
    - **Property 6: Multi-Select Filter Consistency**
    - **Validates: Requirements 8.4, 8.5, 8.6, 8.7**
  
  - [ ]* 12.7 Write property test for filter tag display accuracy
    - **Property 27: Filter Tag Display Accuracy**
    - **Validates: Requirements 8.4, 8.5, 8.6, 8.7**

- [x] 13. Implement single-select filters
  - [x] 13.1 Create single-select Language filter
    - Implement dropdown with all languages
    - Display dropdown arrow indicator
    - Highlight selected option
    - _Requirements: 9.1, 9.4, 9.5_
  
  - [x] 13.2 Create single-select Phase filter
    - Implement dropdown with phases (Evangelism, Discipleship, Leadership)
    - Display dropdown arrow indicator
    - Highlight selected option
    - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [x] 14. Implement empty state handling
  - [x] 14.1 Add empty state message
    - Display "No data available for the selected filters" when users array is empty
    - Style with appropriate background and text colors
    - _Requirements: 13.1, 13.2_
  
  - [x] 14.2 Filter out zero-value boxes and bands
    - Exclude boxes with zero users from layout
    - Exclude bands with zero flow volume from rendering
    - _Requirements: 13.3, 13.4_
  
  - [ ]* 14.3 Write property test for zero-value filtering
    - **Property 26: Zero-Value Filtering**
    - **Validates: Requirements 13.3, 13.4**

- [ ] 15. Implement responsive design features
  - [ ] 15.1 Add responsive layout adjustments
    - Use SVG viewBox for scalable rendering
    - Reduce horizontal spacing for viewports < 768px
    - Reduce font sizes for viewports < 768px
    - Maintain aspect ratio when scaling
    - Ensure minimum canvas width of 600px
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [ ]* 15.2 Write property test for aspect ratio preservation
    - **Property: Aspect Ratio Preservation**
    - **Validates: Requirements 15.4**

- [ ] 16. Implement performance optimizations
  - [ ] 16.1 Optimize data aggregation
    - Use hash maps for O(1) lookup when grouping users
    - Calculate all positions in single pass through data
    - _Requirements: 14.1, 14.2_
  
  - [ ] 16.2 Optimize React rendering
    - Wrap SankeyVisualization with React.memo
    - Apply path simplification for >50 flow bands
    - Ensure transitions complete within 500ms
    - _Requirements: 14.3, 14.5, 14.6_
  
  - [ ] 16.3 Debounce hover events
    - Reduce tooltip update frequency
    - _Requirements: 14.4_

- [ ] 17. Checkpoint - Verify performance
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Implement accessibility features
  - [ ] 18.1 Add ARIA labels and keyboard support
    - Add aria-label attributes to all PhaseBox components
    - Add aria-label attributes to all FlowBand components
    - Add focus outline styling for keyboard navigation
    - Allow keyboard activation (Enter/Space) for expandable boxes
    - _Requirements: 16.1, 16.2, 16.3, 16.6_
  
  - [ ]* 18.2 Write property test for ARIA label presence
    - **Property: ARIA Label Presence**
    - **Validates: Requirements 16.1, 16.2**
  
  - [ ]* 18.3 Write property test for keyboard focus visibility
    - **Property: Keyboard Focus Visibility**
    - **Validates: Requirements 16.3**
  
  - [ ] 18.4 Ensure color contrast compliance
    - Verify all text-on-background combinations meet WCAG AA (4.5:1 ratio)
    - Adjust colors if needed to meet standards
    - _Requirements: 16.4_
  
  - [ ]* 18.5 Write property test for color contrast compliance
    - **Property: Color Contrast Compliance**
    - **Validates: Requirements 16.4**
  
  - [ ] 18.6 Create alternative text-based data table view
    - Implement table component showing flow data in accessible format
    - _Requirements: 16.5_

- [x] 19. Integrate SankeyVisualization into main application
  - [x] 19.1 Replace BubbleVisualization with SankeyVisualization
    - Update UserExplorer component to use SankeyVisualization
    - Pass filtered users array as prop
    - Ensure all existing filters work correctly
    - Integrate ThemeProvider and ThemeToggle
    - _Requirements: All_
  
  - [ ]* 19.2 Write integration tests
    - Test complete user flow from filters to visualization
    - Test interaction between components
    - Test expansion/collapse functionality
    - Test theme switching
    - _Requirements: All_

- [ ] 20. Final checkpoint and validation
  - [ ] 20.1 Verify all correctness properties
    - Run all property-based tests
    - Verify all requirements are met
    - Test with various data sets and edge cases
  
  - [ ]* 20.2 Write property test for color distinction for categories
    - **Property 19: Color Distinction for Categories**
    - **Validates: Requirements 12.10, 12.11**
  
  - [ ]* 20.3 Write property test for data type validity
    - **Property 30-33: Country, Conversation, Goal, Medium Type Validity**
    - **Validates: Requirements 11.1-11.10**
  
  - [ ] 20.4 Final manual testing
    - Test on different screen sizes
    - Test with large datasets (>100 users)
    - Test with edge cases (empty data, single user, etc.)
    - Verify smooth animations and interactions
    - Test expansion/collapse with different categories
    - Test theme switching across all components
    - Test all filter combinations

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties from the design document
- Unit tests and integration tests validate specific examples and edge cases
- The implementation uses TypeScript with React following existing codebase patterns
- SVG rendering with clip paths provides clean text overflow handling
- Hierarchical expandable nodes allow drill-down from categories to individual platforms
- Dynamic 3-column and 4-column layouts adapt to expansion state
- Dark theme by default with light theme toggle provides user preference support
- Multi-select filters with tag-based UI provide intuitive filtering experience
- Performance optimizations ensure smooth experience with large datasets
- Accessibility features ensure the visualization is usable by all users

## Implementation Status Summary

### Completed Features
- ✅ Core data structures with updated types (medium, conversation, goal)
- ✅ Hierarchical data aggregation (Social Media and Ads expansion)
- ✅ Dynamic layout engine (3-column and 4-column support)
- ✅ SVG rendering with clip paths for text overflow prevention
- ✅ Hierarchical expansion interaction with smooth transitions
- ✅ Interactive tooltip system
- ✅ Visual feedback and hover effects
- ✅ Dark theme with ThemeProvider and ThemeToggle
- ✅ Multi-select filters (Country, Brand/Content, Conversation)
- ✅ Single-select filters (Language, Phase)
- ✅ Compact horizontal filter layout
- ✅ Empty state handling
- ✅ Integration into main application

### Remaining Features
- ⏳ Responsive design adjustments
- ⏳ Performance optimizations (React.memo, debouncing)
- ⏳ Accessibility features (ARIA labels, keyboard support)
- ⏳ Alternative text-based data table view
- ⏳ Property-based tests (all marked with *)
- ⏳ Integration tests
