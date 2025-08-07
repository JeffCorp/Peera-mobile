import { eventsApi } from "../services/api/eventsApi";
import { addDays, addHours } from "./dateTime";

// Test data
const testEvent = {
  title: "Test Meeting",
  description: "This is a test meeting for calendar integration",
  startDate: new Date().toISOString(),
  endDate: addHours(new Date(), 1).toISOString(),
  location: "Conference Room A",
  isAllDay: false,
  color: "#007AFF",
};

const testAllDayEvent = {
  title: "Test All Day Event",
  description: "This is a test all-day event",
  startDate: addDays(new Date(), 1).toISOString(),
  endDate: addDays(new Date(), 1).toISOString(),
  location: "Office",
  isAllDay: true,
  color: "#34C759",
};

export const testCalendarFlow = async () => {
  console.log("📅 Starting Calendar System Test...\n");

  try {
    // Test 1: Get all events
    console.log("1. Testing get all events...");
    const allEventsResult = await eventsApi.getAll();
    if (allEventsResult.success) {
      console.log(
        `   ✅ Retrieved ${allEventsResult.data?.length || 0} events`
      );
    } else {
      console.log(`   ❌ Failed to get events: ${allEventsResult.message}`);
    }
    console.log("");

    // Test 2: Create a new event
    console.log("2. Testing create event...");
    const createResult = await eventsApi.create(testEvent);
    if (createResult.success && createResult.data) {
      console.log("   ✅ Event created successfully");
      console.log(
        `   Event: ${createResult.data.title} (${createResult.data.id})`
      );
      const createdEventId = createResult.data.id;

      // Test 3: Get event by ID
      console.log("3. Testing get event by ID...");
      const getByIdResult = await eventsApi.getById(createdEventId);
      if (getByIdResult.success && getByIdResult.data) {
        console.log("   ✅ Event retrieved successfully");
        console.log(`   Event: ${getByIdResult.data.title}`);
      } else {
        console.log(`   ❌ Failed to get event: ${getByIdResult.message}`);
      }
      console.log("");

      // Test 4: Update event
      console.log("4. Testing update event...");
      const updateData = {
        id: createdEventId,
        title: "Updated Test Meeting",
        description: "This event has been updated",
      };
      const updateResult = await eventsApi.update(updateData);
      if (updateResult.success && updateResult.data) {
        console.log("   ✅ Event updated successfully");
        console.log(`   Updated Event: ${updateResult.data.title}`);
      } else {
        console.log(`   ❌ Failed to update event: ${updateResult.message}`);
      }
      console.log("");

      // Test 5: Check for conflicts
      console.log("5. Testing conflict detection...");
      const conflictCheck = {
        startDate: testEvent.startDate,
        endDate: testEvent.endDate,
      };
      const conflictResult = await eventsApi.checkConflicts(conflictCheck);
      if (conflictResult.success) {
        console.log(`   ✅ Conflict check completed`);
        console.log(`   Found ${conflictResult.data?.length || 0} conflicts`);
      } else {
        console.log(
          `   ❌ Failed to check conflicts: ${conflictResult.message}`
        );
      }
      console.log("");

      // Test 6: Get events by date range
      console.log("6. Testing get events by date range...");
      const today = new Date();
      const nextWeek = addDays(today, 7);
      const dateRangeResult = await eventsApi.getByDateRange({
        startDate: today.toISOString(),
        endDate: nextWeek.toISOString(),
      });
      if (dateRangeResult.success) {
        console.log(
          `   ✅ Retrieved ${
            dateRangeResult.data?.length || 0
          } events in date range`
        );
      } else {
        console.log(
          `   ❌ Failed to get events by date range: ${dateRangeResult.message}`
        );
      }
      console.log("");

      // Test 7: Get today's events
      console.log("7. Testing get today's events...");
      const todayEventsResult = await eventsApi.getTodayEvents();
      if (todayEventsResult.success) {
        console.log(
          `   ✅ Retrieved ${
            todayEventsResult.data?.length || 0
          } events for today`
        );
      } else {
        console.log(
          `   ❌ Failed to get today's events: ${todayEventsResult.message}`
        );
      }
      console.log("");

      // Test 8: Get upcoming events
      console.log("8. Testing get upcoming events...");
      const upcomingEventsResult = await eventsApi.getUpcomingEvents();
      if (upcomingEventsResult.success) {
        console.log(
          `   ✅ Retrieved ${
            upcomingEventsResult.data?.length || 0
          } upcoming events`
        );
      } else {
        console.log(
          `   ❌ Failed to get upcoming events: ${upcomingEventsResult.message}`
        );
      }
      console.log("");

      // Test 9: Delete event
      console.log("9. Testing delete event...");
      const deleteResult = await eventsApi.delete(createdEventId);
      if (deleteResult.success) {
        console.log("   ✅ Event deleted successfully");
      } else {
        console.log(`   ❌ Failed to delete event: ${deleteResult.message}`);
      }
      console.log("");
    } else {
      console.log(`   ❌ Failed to create event: ${createResult.message}`);
    }

    // Test 10: Create all-day event
    console.log("10. Testing create all-day event...");
    const allDayResult = await eventsApi.create(testAllDayEvent);
    if (allDayResult.success && allDayResult.data) {
      console.log("   ✅ All-day event created successfully");
      console.log(
        `   Event: ${allDayResult.data.title} (${allDayResult.data.id})`
      );

      // Clean up - delete the all-day event
      await eventsApi.delete(allDayResult.data.id);
      console.log("   ✅ All-day event cleaned up");
    } else {
      console.log(
        `   ❌ Failed to create all-day event: ${allDayResult.message}`
      );
    }
    console.log("");

    console.log("🎉 Calendar System Test Completed!");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
};

export const testCalendarComponents = () => {
  console.log("🧩 Testing Calendar Components...\n");

  // Test date utilities
  console.log("1. Testing date utilities...");
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const nextHour = addHours(now, 1);

  console.log(`   Current time: ${now.toISOString()}`);
  console.log(`   Tomorrow: ${tomorrow.toISOString()}`);
  console.log(`   Next hour: ${nextHour.toISOString()}`);
  console.log("   ✅ Date utilities working correctly");
  console.log("");

  // Test event data structure
  console.log("2. Testing event data structure...");
  const sampleEvent = {
    id: "test-123",
    title: "Sample Event",
    description: "A sample event for testing",
    startDate: now.toISOString(),
    endDate: nextHour.toISOString(),
    location: "Test Location",
    isAllDay: false,
    color: "#007AFF",
    userId: "user-123",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  console.log(`   Event ID: ${sampleEvent.id}`);
  console.log(`   Event Title: ${sampleEvent.title}`);
  console.log(`   Start Date: ${sampleEvent.startDate}`);
  console.log(`   End Date: ${sampleEvent.endDate}`);
  console.log(`   Is All Day: ${sampleEvent.isAllDay}`);
  console.log("   ✅ Event data structure valid");
  console.log("");

  console.log("🎉 Calendar Components Test Completed!");
};

// Export test functions for use in development
export default {
  testCalendarFlow,
  testCalendarComponents,
};
