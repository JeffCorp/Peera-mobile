import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "../../api/client";
import { API_ENDPOINTS } from "../../config/env";

// Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  isAllDay: boolean;
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  isLoading: boolean;
  error: string | null;
  selectedDate: string | null;
}

export interface CreateEventData {
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  isAllDay: boolean;
  color?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

// Initial state
const initialState: CalendarState = {
  events: [] as CalendarEvent[],
  selectedEvent: null,
  isLoading: false,
  error: null,
  selectedDate: null,
};

// Async thunks
export const fetchEvents = createAsyncThunk(
  "calendar/fetchEvents",
  async (
    dateRange: { startTime: string; endTime: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      let url = API_ENDPOINTS.EVENTS;
      if (dateRange) {
        const params = new URLSearchParams({
          startDate: dateRange.startTime,
          endDate: dateRange.endTime,
        });
        url = `${url}?${params}` as any;
      }

      const response = await apiClient.get(url);

      console.log("response.data => ", response);
      console.log("url => ", url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch events");
    }
  }
);

export const createEvent = createAsyncThunk(
  "calendar/createEvent",
  async (eventData: CreateEventData, { rejectWithValue }) => {
    try {
      console.log("event data 81 => ", eventData);

      const response = await apiClient.post(API_ENDPOINTS.EVENTS, eventData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create event");
    }
  }
);

export const updateEvent = createAsyncThunk(
  "calendar/updateEvent",
  async (eventData: UpdateEventData, { rejectWithValue }) => {
    try {
      const { id, ...data } = eventData;
      const response = await apiClient.put(API_ENDPOINTS.EVENT_BY_ID(id), data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update event");
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "calendar/deleteEvent",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(API_ENDPOINTS.EVENT_BY_ID(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete event");
    }
  }
);

export const getEventById = createAsyncThunk(
  "calendar/getEventById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EVENT_BY_ID(id));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to get event");
    }
  }
);

// Calendar slice
const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedEvent: (state, action: PayloadAction<CalendarEvent | null>) => {
      state.selectedEvent = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    addEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.events.push(action.payload);
    },
    updateEventInList: (state, action: PayloadAction<CalendarEvent>) => {
      const index = state.events.findIndex(
        (event) => event.id === action.payload.id
      );
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    removeEventFromList: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(
        (event) => event.id !== action.payload
      );
    },
    clearEvents: (state) => {
      state.events = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Events
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Event
    builder
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.push(action.payload);
        state.error = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Event
    builder
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.events.findIndex(
          (event) => event.id === action.payload.id
        );
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Event
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = state.events.filter(
          (event) => event.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Event By ID
    builder
      .addCase(getEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEventById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedEvent = action.payload;
        state.error = null;
      })
      .addCase(getEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setSelectedEvent,
  setSelectedDate,
  addEvent,
  updateEventInList,
  removeEventFromList,
  clearEvents,
} = calendarSlice.actions;

export default calendarSlice.reducer;
