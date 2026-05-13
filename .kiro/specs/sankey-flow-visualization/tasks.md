# Implementation Plan: Sankey Flow Visualization

## Overview

This implementation plan transforms the current box-based bubble visualization into an interactive Sankey diagram with three phases (Content → Conversation → Goal). The implementation uses TypeScript with React, SVG for rendering curved flow bands, and follows the existing codebase patterns. The plan includes data aggregation, layout calculation with collision detection, SVG rendering with curved paths, interactive tooltips, and comprehensive testing for correctness properties.

## Tasks

- [x] 1. Set up core data structures and types
  - Create TypeScript interfaces for FlowData, PhaseBox, FlowBand, and LayoutData
  - Define types for aggregated flows between phases
  - Create color mapping constants for all categories
  - _Requirements: 1.1, 1.2, 1.3, 10.1-10.10_

- [ ] 2. Implement data aggregation module
  - [x] 2.1 Create DataAggregator utility functions
    - Implement groupUsersByMedium() to aggregate Phase 1 boxes
    - Implement groupUsersByConversationType() to aggregate Phase 2 boxes
    - Implement groupUsersByGoal() to aggregate Phase 3 boxes
    - Calculate user counts and percentages for each box
    - _Requirements: 1.1, 1.2, 1.3, 1.7, 1.8_
  
  - [ ]* 2.2 Write property test for user grouping completeness
    - **Property 1: User Grouping Completeness**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.7**
  
  - [ ]* 2.3 Write property test for percentage calculation
    - **Property 3: Percentage Calculation Correctness**
    - **Validates: Requirements 1.8**
  
  - [x] 2.4 Create flow calculation functions
    - Implement calculateFlowsBetweenPhases() for Phase 1→2 and Phase 2→3
    - Count users for each (source, destination) pair
    - Handle users with undefined conversationType
    - _Requirements: 1.4, 1.5, 1.6_
  
  - [ ]* 2.5 Write property test for flow count accuracy
    - **Property 2: Flow Count Accuracy**
    - **Validates: Requirements 1.4, 1.5, 1.6**

- [ ] 3. Checkpoint - Verify data aggregation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement layout engine module
  - [x] 4.1 Create box positioning functions
    - Implement positionPhaseBoxes() to calculate x,y coordinates for all boxes
    - Position Phase 1 boxes in left column, Phase 2 in center, Phase 3 in right
    - Calculate box heights proportional to user counts with minimum height of 40px
    - Distribute boxes vertically with equal spacing (minimum 20px)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ]* 4.2 Write property test for phase column positioning
    - **Property 4: Phase Column Positioning**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  
  - [ ]* 4.3 Write property test for vertical spacing uniformity
    - **Property 5: Vertical Spacing Uniformity**
    - **Validates: Requirements 2.4**
  
  - [ ]* 4.4 Write property test for box height proportionality
    - **Property 6: Box Height Proportionality**
    - **Validates: Requirements 2.5, 2.6**
  
  - [x] 4.5 Create band routing functions with collision detection
    - Implement routeFlowBands() to calculate band paths between boxes
    - Detect potential collisions between bands
    - Adjust vertical offsets to prevent overlaps
    - Calculate Bezier curve control points for smooth curves
    - _Requirements: 2.8, 2.9, 2.10_
  
  - [ ]* 4.6 Write property test for collision-free band routing
    - **Property 7: Collision-Free Band Routing**
    - **Validates: Requirements 2.8, 2.9**
  
  - [ ]* 4.7 Write property test for valid Bezier control points
    - **Property 8: Valid Bezier Control Points**
    - **Validates: Requirements 2.10**

- [ ] 5. Checkpoint - Verify layout calculations
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement SVG rendering components
  - [x] 6.1 Create PhaseBox SVG component
    - Render SVG rectangle with gradient fill based on category
    - Display centered label text
    - Display user count and percentage inside box
    - Apply color gradients from color mapping constants
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 6.2 Write property test for SVG element completeness
    - **Property 9: SVG Element Completeness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
  
  - [x] 6.3 Create FlowBand SVG component
    - Render SVG path using cubic Bezier curves
    - Set stroke width proportional to flow volume
    - Apply semi-transparent color matching source box
    - Ensure bands render behind boxes (z-order)
    - _Requirements: 3.5, 3.6, 3.7, 3.8_
  
  - [ ]* 6.4 Write property test for band stroke width proportionality
    - **Property 10: Band Stroke Width Proportionality**
    - **Validates: Requirements 3.6**
  
  - [ ]* 6.5 Write property test for color inheritance and transparency
    - **Property 11: Color Inheritance and Transparency**
    - **Validates: Requirements 3.7**
  
  - [ ]* 6.6 Write property test for z-order correctness
    - **Property 12: Z-Order Correctness**
    - **Validates: Requirements 3.8**
  
  - [x] 6.7 Create phase label renderer
    - Render phase labels ("Content", "Conversation", "Goal") above each column
    - _Requirements: 3.9_

- [ ] 7. Implement interactive tooltip system
  - [x] 7.1 Create Tooltip component
    - Display source label, destination label, flow volume, and percentage
    - Position tooltip near mouse cursor within viewport bounds
    - Apply dark background with white text
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [ ]* 7.2 Write property test for tooltip content completeness
    - **Property 13: Tooltip Content Completeness**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
  
  - [ ]* 7.3 Write property test for tooltip positioning
    - **Property 14: Tooltip Positioning**
    - **Validates: Requirements 4.6**
  
  - [x] 7.4 Implement hover event handlers
    - Add onMouseEnter and onMouseLeave handlers to FlowBand components
    - Debounce hover events to reduce update frequency
    - _Requirements: 4.1, 4.7, 8.4_
  
  - [ ]* 7.5 Write property test for hover event debouncing
    - **Property 18: Hover Event Debouncing**
    - **Validates: Requirements 8.4**

- [ ] 8. Checkpoint - Verify interactivity
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement visual feedback and hover effects
  - [ ] 9.1 Add hover effects to FlowBand components
    - Increase band opacity on hover
    - Apply subtle shadow effect on hover
    - Add smooth CSS transitions
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ] 9.2 Add hover effects to PhaseBox components
    - Apply scale transform to enlarge box slightly on hover
    - Increase box shadow intensity on hover
    - Add smooth CSS transitions
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [ ]* 9.3 Write property test for hover state transitions
    - **Property 15: Hover State Transitions**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [ ] 10. Implement empty state and zero-value filtering
  - [ ] 10.1 Add empty state handling
    - Display "No data available for the selected filters" when users array is empty
    - Filter out boxes with zero users from layout
    - Filter out bands with zero flow volume from rendering
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 10.2 Write property test for zero-value filtering
    - **Property 16: Zero-Value Filtering**
    - **Validates: Requirements 6.3, 6.4**

- [ ] 11. Implement responsive design features
  - [ ] 11.1 Add responsive layout adjustments
    - Use SVG viewBox for scalable rendering
    - Reduce horizontal spacing for viewports < 768px
    - Reduce font sizes for viewports < 768px
    - Maintain aspect ratio when scaling
    - Ensure minimum canvas width of 600px
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 11.2 Write property test for aspect ratio preservation
    - **Property 17: Aspect Ratio Preservation**
    - **Validates: Requirements 7.4**

- [ ] 12. Implement performance optimizations
  - [ ] 12.1 Optimize data aggregation
    - Use hash maps for O(1) lookup when grouping users
    - Calculate all positions in single pass through data
    - _Requirements: 8.1, 8.2_
  
  - [ ] 12.2 Optimize React rendering
    - Wrap SankeyVisualization with React.memo
    - Apply path simplification for >50 flow bands
    - _Requirements: 8.3, 8.5_

- [ ] 13. Checkpoint - Verify performance
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement accessibility features
  - [ ] 14.1 Add ARIA labels and keyboard support
    - Add aria-label attributes to all PhaseBox components
    - Add aria-label attributes to all FlowBand components
    - Add focus outline styling for keyboard navigation
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 14.2 Write property test for ARIA label presence
    - **Property 19: ARIA Label Presence**
    - **Validates: Requirements 9.1, 9.2**
  
  - [ ]* 14.3 Write property test for keyboard focus visibility
    - **Property 20: Keyboard Focus Visibility**
    - **Validates: Requirements 9.3**
  
  - [ ] 14.4 Ensure color contrast compliance
    - Verify all text-on-background combinations meet WCAG AA (4.5:1 ratio)
    - Adjust colors if needed to meet standards
    - _Requirements: 9.4_
  
  - [ ]* 14.5 Write property test for color contrast compliance
    - **Property 21: Color Contrast Compliance**
    - **Validates: Requirements 9.4**
  
  - [ ] 14.6 Create alternative text-based data table view
    - Implement table component showing flow data in accessible format
    - _Requirements: 9.5_

- [ ] 15. Integrate SankeyVisualization into main application
  - [x] 15.1 Replace BubbleVisualization with SankeyVisualization
    - Update UserExplorer component to use SankeyVisualization
    - Pass filtered users array as prop
    - Ensure all existing filters work correctly
    - _Requirements: All_
  
  - [ ]* 15.2 Write integration tests
    - Test complete user flow from filters to visualization
    - Test interaction between components
    - _Requirements: All_

- [ ] 16. Final checkpoint and validation
  - [ ] 16.1 Verify all correctness properties
    - Run all property-based tests
    - Verify all requirements are met
    - Test with various data sets and edge cases
  
  - [ ]* 16.2 Write property test for color mapping correctness
    - **Property 22: Color Mapping Correctness**
    - **Validates: Requirements 10.1-10.10**
  
  - [ ]* 16.3 Write property test for color distinctness
    - **Property 23: Color Distinctness**
    - **Validates: Requirements 10.8**
  
  - [ ] 16.4 Final manual testing
    - Test on different screen sizes
    - Test with large datasets (>100 users)
    - Test with edge cases (empty data, single user, etc.)
    - Verify smooth animations and interactions

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties from the design document
- Unit tests and integration tests validate specific examples and edge cases
- The implementation uses TypeScript with React following existing codebase patterns
- SVG rendering provides scalable, high-quality visualization
- Performance optimizations ensure smooth experience with large datasets
- Accessibility features ensure the visualization is usable by all users
