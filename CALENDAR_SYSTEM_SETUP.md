# Calendar System Setup

This document describes the complete calendar system implementation for the React Native app that integrates with a NestJS Events API.

## Overview

The calendar system includes:

- Redux store for events management with CRUD operations
- API service for events with conflict detection
- Calendar view using react-native-calendars
- Event management components
- Date/time utilities and formatting
- Real-time updates and optimistic UI

## Architecture

### 1. Redux Store (Calendar Slice)

- **Location**: `src/store/slices/calendarSlice.ts`
- **Features**:
  - CRUD operations for events
  - Calendar state management
  - Loading and error states
  - Optimistic updates

### 2. Events API Service

- **Location**: `src/services/api/eventsApi.ts`
- **Features**:
  - `eventsApi.create()` - Create new events
  - `eventsApi.getAll()` - Get all events
  - `eventsApi.getByDateRange()` - Get events by date range
  - `eventsApi.update()` - Update existing events
  - `eventsApi.delete()` - Delete events
  - `eventsApi.checkConflicts()` - Check for scheduling conflicts
  - `eventsApi.getTodayEvents()` - Get today's events
  - `eventsApi.getUpcomingEvents()` - Get upcoming events

### 3. Calendar Components

- **EventCard**: `src/components/calendar/EventCard.tsx`
- **CalendarEventList**: `src/components/calendar/CalendarEventList.tsx`
- **AddEventForm**: `src/components/calendar/AddEventForm.tsx`
- **ConflictWarning**: `src/components/calendar/ConflictWarning.tsx`

### 4. Date/Time Utilities

- **Location**: `src/utils/dateTime.ts`
- **Features**:
  - Date formatting and manipulation
  - Timezone management
  - Duration calculations
  - Calendar utilities
  - Validation functions

### 5. Calendar Screens

- **CalendarScreen**: `src/screens/main/CalendarScreen.tsx`
- **Event Detail/Edit screens** (can be extended)

## API Endpoints

The calendar system expects the following NestJS backend endpoints:

```typescript
// Events endpoints
GET    /events                    // Get all events
GET    /events?startDate=X&endDate=Y  // Get events by date range
GET    /events/:id                // Get event by ID
POST   /events                    // Create new event
PUT    /events/:id                // Update event
DELETE /events/:id                // Delete event
GET    /events/conflicts?startDate=X&endDate=Y&excludeEventId=Z  // Check conflicts
```

## Expected API Response Format

```typescript
// Success response
{
  success: true,
  data: {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    location?: string;
    isAllDay: boolean;
    color?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  },
  message?: string;
}

// Error response
{
  success: false,
  message: string;
}
```

## Testing the Calendar System

### 1. Start the NestJS Backend

Make sure your NestJS backend is running on `http://localhost:3000` with the required endpoints implemented.

### 2. Run the React Native App

```bash
npm start
# or
expo start
```

### 3. Test Flow: Create → View → Edit → Delete

#### Step 1: Create an Event

1. Navigate to the Calendar tab
2. Tap "Add Event" button
3. Fill in the form:
   - Title: "Test Meeting"
   - Description: "This is a test meeting"
   - Date: Select today's date
   - Start Time: Select a time
   - End Time: Select a time 1 hour later
   - Location: "Conference Room A"
4. Tap "Create Event"
5. Verify successful creation

#### Step 2: View Event in Calendar

1. The event should appear as a dot on the calendar
2. Tap on the date to see the event in the list below
3. Verify event details are displayed correctly

#### Step 3: Edit Event

1. Tap on the event in the list
2. Select "Edit" from the options
3. Modify the event details
4. Save changes
5. Verify updates are reflected

#### Step 4: Delete Event

1. Tap on the event in the list
2. Select "Delete" from the options
3. Confirm deletion
4. Verify event is removed from calendar

### 4. Test Conflict Detection

1. Create an event for a specific time
2. Try to create another event that overlaps with the first
3. Verify conflict warning is displayed
4. Choose to proceed or cancel

### 5. Test All-Day Events

1. Create an event and mark it as "All Day"
2. Verify it appears correctly in the calendar
3. Test editing and deleting all-day events

## Configuration

### Environment Variables

Update `src/config/env.ts` with your backend configuration:

```typescript
export const API_ENDPOINTS = {
  EVENTS: "/events",
  EVENT_BY_ID: (id: string) => `/events/${id}`,
  // ... other endpoints
};
```

### Calendar Theme

Customize the calendar appearance in `CalendarScreen.tsx`:

```typescript
theme={{
  backgroundColor: '#ffffff',
  calendarBackground: '#ffffff',
  selectedDayBackgroundColor: '#007AFF',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#007AFF',
  dayTextColor: '#2d4150',
  textDisabledColor: '#d9e1e8',
  dotColor: '#007AFF',
  selectedDotColor: '#ffffff',
  arrowColor: '#007AFF',
  monthTextColor: '#2d4150',
  indicatorColor: '#007AFF',
  // ... other theme properties
}}
```

## Features

### Event Management

- **Create Events**: Full form with validation
- **Edit Events**: Modify existing events
- **Delete Events**: Remove events with confirmation
- **All-Day Events**: Support for all-day events
- **Event Colors**: Customizable event colors

### Calendar View

- **Monthly View**: Standard calendar grid
- **Event Markers**: Visual indicators for events
- **Date Selection**: Tap to view events for specific dates
- **Today Highlighting**: Current date is highlighted

### Conflict Detection

- **Real-time Checking**: Check for conflicts when creating events
- **Conflict Warnings**: Display conflicts to users
- **Override Option**: Allow users to proceed despite conflicts

### Date/Time Handling

- **Timezone Support**: Local timezone handling
- **Date Formatting**: Consistent date/time display
- **Duration Calculation**: Calculate event durations
- **Validation**: Ensure valid dates and times

### Real-time Updates

- **Optimistic Updates**: Immediate UI updates
- **Error Handling**: Graceful error handling
- **Loading States**: Show loading indicators
- **Refresh Support**: Pull-to-refresh functionality

## Components

### EventCard

Displays individual events with:

- Event title and description
- Time range and duration
- Location information
- Event color coding
- Compact and full display modes

### CalendarEventList

Lists events with:

- Grouping by date
- Date headers (Today, Yesterday, Tomorrow)
- Pull-to-refresh functionality
- Empty state handling
- Event press handling

### AddEventForm

Form for creating/editing events with:

- Title and description fields
- Date and time pickers
- Location field
- All-day event toggle
- Form validation
- Conflict detection

### ConflictWarning

Displays scheduling conflicts with:

- Conflict count
- List of conflicting events
- Dismiss functionality
- Compact and full display modes

## Utilities

### Date/Time Functions

- `formatDate()` - Format dates in various styles
- `formatTime()` - Format time with options
- `formatTimeRange()` - Format time ranges
- `addDays()`, `addHours()`, `addMinutes()` - Date manipulation
- `startOfDay()`, `endOfDay()` - Day boundaries
- `isToday()`, `isYesterday()`, `isTomorrow()` - Date comparison
- `getDurationInMinutes()` - Calculate duration
- `formatDuration()` - Format duration display

### Calendar Functions

- `getCalendarDays()` - Get calendar grid days
- `getDaysInMonth()` - Get days in month
- `getFirstDayOfMonth()` - Get first day of month

### Validation Functions

- `isValidDate()` - Validate date objects
- `isDateInPast()` - Check if date is in past
- `isDateInFuture()` - Check if date is in future
- `hasTimeConflict()` - Check for time conflicts

## Troubleshooting

### Common Issues

1. **Events Not Loading**

   - Check backend API endpoints
   - Verify authentication is working
   - Check network connectivity
   - Review API response format

2. **Calendar Not Displaying**

   - Ensure react-native-calendars is installed
   - Check calendar theme configuration
   - Verify date formatting

3. **Date/Time Issues**

   - Check timezone settings
   - Verify date picker configuration
   - Review date utility functions

4. **Conflict Detection Not Working**
   - Verify conflict endpoint implementation
   - Check date range parameters
   - Review conflict checking logic

### Debug Tools

Use the test utilities in `src/utils/testCalendar.ts`:

```typescript
import {
  testCalendarFlow,
  testCalendarComponents,
} from "../utils/testCalendar";

// Test the complete calendar flow
await testCalendarFlow();

// Test calendar components
testCalendarComponents();
```

## Next Steps

1. **Event Categories**: Add event categories and filtering
2. **Recurring Events**: Support for recurring events
3. **Event Sharing**: Share events with other users
4. **Calendar Sync**: Sync with external calendars
5. **Notifications**: Event reminders and notifications
6. **Advanced Views**: Week and day views
7. **Event Templates**: Predefined event templates
8. **Analytics**: Event analytics and insights

## Dependencies

The calendar system uses the following key dependencies:

- `react-native-calendars`: Calendar component
- `@react-native-community/datetimepicker`: Date/time picker
- `@reduxjs/toolkit`: State management
- `react-redux`: Redux integration
- `axios`: HTTP client for API calls

## Support

For issues or questions about the calendar implementation, refer to:

- React Native documentation
- react-native-calendars documentation
- Redux Toolkit documentation
- NestJS documentation
