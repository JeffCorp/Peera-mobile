import { apiClient } from "../../api/client";
import { API_ENDPOINTS } from "../../config/env";

// Types
export interface CalendarEvent {
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
}

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isAllDay: boolean;
  color?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ConflictCheck {
  startTime: string;
  endTime: string;
  excludeEventId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class EventsApiService {
  // Get all events
  async getAll(): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const response = await apiClient.get<CalendarEvent[]>(
        API_ENDPOINTS.EVENTS
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch events",
      };
    }
  }

  // Get events by date range
  async getByDateRange(
    dateRange: DateRange
  ): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      const url = `${API_ENDPOINTS.EVENTS}?${params}`;
      const response = await apiClient.get<CalendarEvent[]>(url);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch events by date range",
      };
    }
  }

  // Get event by ID
  async getById(id: string): Promise<ApiResponse<CalendarEvent>> {
    try {
      const response = await apiClient.get<CalendarEvent>(
        API_ENDPOINTS.EVENT_BY_ID(id)
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch event",
      };
    }
  }

  // Create new event
  async create(
    eventData: CreateEventData
  ): Promise<ApiResponse<CalendarEvent>> {
    try {
      const response = await apiClient.post<CalendarEvent>(
        API_ENDPOINTS.EVENTS,
        eventData
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to create event",
      };
    }
  }

  // Update event
  async update(
    eventData: UpdateEventData
  ): Promise<ApiResponse<CalendarEvent>> {
    try {
      const { id, ...data } = eventData;
      const response = await apiClient.put<CalendarEvent>(
        API_ENDPOINTS.EVENT_BY_ID(id),
        data
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update event",
      };
    }
  }

  // Delete event
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(API_ENDPOINTS.EVENT_BY_ID(id));
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to delete event",
      };
    }
  }

  // Check for scheduling conflicts
  async checkConflicts(
    conflictCheck: ConflictCheck
  ): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const params = new URLSearchParams({
        startTime: conflictCheck.startTime,
        endTime: conflictCheck.endTime,
        ...(conflictCheck.excludeEventId && {
          excludeEventId: conflictCheck.excludeEventId,
        }),
      });
      const url = `${API_ENDPOINTS.EVENTS}/conflicts?${params}`;
      const response = await apiClient.get<CalendarEvent[]>(url);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to check conflicts",
      };
    }
  }

  // Get today's events
  async getTodayEvents(): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );

      const dateRange: DateRange = {
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      };

      return await this.getByDateRange(dateRange);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch today's events",
      };
    }
  }

  // Get upcoming events (next 7 days)
  async getUpcomingEvents(): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const dateRange: DateRange = {
        startDate: today.toISOString(),
        endDate: nextWeek.toISOString(),
      };

      return await this.getByDateRange(dateRange);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch upcoming events",
      };
    }
  }
}

export const eventsApi = new EventsApiService();
export default eventsApi;
