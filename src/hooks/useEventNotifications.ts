import { useCallback, useEffect, useRef } from "react";
import { notificationService } from "../services/notificationService";
import { CalendarEvent } from "../store/slices/calendarSlice";

interface UseEventNotificationsProps {
  events: CalendarEvent[];
  enabled?: boolean;
}

export const useEventNotifications = ({
  events,
  enabled = true,
}: UseEventNotificationsProps) => {
  const scheduledNotifications = useRef<Set<string>>(new Set());
  const lastEventsHash = useRef<string>("");

  // Create a hash of events to detect changes efficiently
  const createEventsHash = useCallback((events: CalendarEvent[]): string => {
    return events
      .map((event) => `${event.id}-${event.startTime}-${event.title}`)
      .sort()
      .join("|");
  }, []);

  useEffect(() => {
    if (!enabled || !events || events.length === 0) {
      return;
    }

    const currentHash = createEventsHash(events);

    // Only process if events have actually changed
    if (currentHash === lastEventsHash.current) {
      return;
    }

    lastEventsHash.current = currentHash;

    const scheduleEventNotifications = async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Filter events for today and future dates
      const relevantEvents = events.filter((event) => {
        const eventDate = new Date(event.startTime);
        return eventDate >= today;
      });

      // Batch process notifications
      const relevantEventsForScheduling = relevantEvents.filter((event) => {
        const eventDate = new Date(event.startTime);
        return (
          eventDate.getTime() > now.getTime() &&
          !scheduledNotifications.current.has(event.id)
        );
      });

      if (relevantEventsForScheduling.length > 0) {
        try {
          const batchResults =
            await notificationService.scheduleEventRemindersBatch(
              relevantEventsForScheduling.map((event) => ({
                id: event.id,
                title: event.title,
                startTime: event.startTime,
              }))
            );

          // Mark events as scheduled
          Object.keys(batchResults).forEach((eventId) => {
            if (batchResults[eventId].length > 0) {
              scheduledNotifications.current.add(eventId);
            }
          });

          console.log(
            `Scheduled notifications for ${
              Object.keys(batchResults).length
            } events`
          );
        } catch (error) {
          console.error("Failed to schedule batch notifications:", error);
        }
      }
    };

    // Clean up old notifications for events that no longer exist
    const cleanupOldNotifications = async () => {
      const currentEventIds = new Set(events.map((event) => event.id));
      const eventsToCancel: string[] = [];

      for (const scheduledId of scheduledNotifications.current) {
        if (!currentEventIds.has(scheduledId)) {
          eventsToCancel.push(scheduledId);
        }
      }

      if (eventsToCancel.length > 0) {
        try {
          await notificationService.cancelEventNotifications(eventsToCancel);
          eventsToCancel.forEach((id) =>
            scheduledNotifications.current.delete(id)
          );
          console.log(
            `Cancelled notifications for ${eventsToCancel.length} events`
          );
        } catch (error) {
          console.error("Failed to cancel batch notifications:", error);
        }
      }
    };

    // Process notifications with a small delay to avoid blocking the UI
    const timeoutId = setTimeout(() => {
      scheduleEventNotifications();
      cleanupOldNotifications();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [events, enabled, createEventsHash]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear scheduled notifications when component unmounts
      scheduledNotifications.current.clear();
    };
  }, []);

  return {
    scheduledCount: scheduledNotifications.current.size,
  };
};
