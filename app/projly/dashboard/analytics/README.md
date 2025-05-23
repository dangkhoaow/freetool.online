# Analytics Dashboard Documentation

## Overview
The Analytics Dashboard provides comprehensive insights into project and task metrics through interactive visualizations. It uses React Query for data fetching and Recharts for data visualization.

## Key Features

### Data Visualization
- Project status distribution (pie chart)
- Task status distribution (pie chart)
- Task due date distribution (bar chart)
- Resource type distribution (pie chart)
- Team task distribution (bar chart)

### Color Scheme
The dashboard uses a consistent color scheme that matches the status badge system:

```typescript
const STATUS_COLORS = {
  'Completed': '#16a34a',    // green-600
  'In Progress': '#2563eb',  // blue-600
  'In Review': '#a855f7',    // purple-500
  'Not Started': '#6b7280',  // gray-500
  'On Hold': '#f97316',      // orange-500
  'Pending': '#f59e0b',      // amber-500
  'Active': '#2563eb',       // blue-600
  'Planned': '#8b5cf6',      // purple-500
  'Canceled': '#ef4444',     // red-500
  'Archived': '#6b7280',     // gray-500
  'Overdue': '#ef4444',      // red-500
  'Due Soon': '#f59e0b',     // amber-500
  'Due Later': '#0ea5e9',    // sky-500
  'No Due Date': '#9ca3af',  // gray-400
  // Resource types
  'License': '#16a34a',      // green-600
  'File': '#2563eb',         // blue-600
  'Software': '#a855f7',     // purple-500
  'Equipment': '#f97316',    // orange-500
  'default': '#9ca3af',      // gray-400
};
```

## Components

### Dashboard Layout
- Overview tab with key metrics and charts
- Projects tab with project-specific analytics
- Tasks tab with task-specific analytics

### Charts
- Pie charts for status distributions
- Bar charts for task distributions
- Responsive containers for all charts
- Interactive tooltips and legends

## Data Integration

### React Query Hooks
The dashboard uses custom hooks for data fetching:
- `useTaskStatusAnalytics`
- `useTaskDueDateAnalytics`
- `useProjectStatusAnalytics`
- `useResourcesAnalytics`
- `useTeamTaskDistributionAnalytics`
- `useTaskTimelineAnalytics`

### Data Transformation
Data is transformed to match chart requirements:
```typescript
const transformToChartData = (data: any[], nameKey: string, valueKey: string) => {
  return data.map(item => ({
    name: String(item[nameKey] || 'Unknown'),
    value: typeof item[valueKey] === 'number' ? item[valueKey] : 0
  }));
};
```

## Error Handling
- Loading states for each data fetch
- Error toasts for failed API calls
- Fallback UI for missing data

## Recent Updates (2025-05-21)
- Implemented status-based color scheme
- Added comprehensive logging
- Enhanced error handling
- Improved data transformation
- Added new analytics views

## Related Documentation
- [Analytics Hooks Documentation](/lib/services/projly/use-analytics.README.md)
- [Analytics Components Documentation](/app/projly/components/analytics/README.md)
- [Backend Analytics API Documentation](/service.freetool.online/app/api/projly/analytics/README.md) 