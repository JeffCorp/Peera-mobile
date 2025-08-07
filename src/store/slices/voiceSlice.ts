import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "../../api/client";
import { API_ENDPOINTS } from "../../config/env";

// Types
export interface VoiceCommand {
  id: string;
  transcription: string;
  response: string;
  timestamp: string;
  userId: string;
}

export interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  isLoading: boolean;
  transcription: string;
  response: string;
  error: string | null;
  recentCommands: VoiceCommand[];
  recordingDuration: number;
}

export interface ProcessVoiceData {
  audioFile: any;
  transcription?: string;
}

// Initial state
const initialState: VoiceState = {
  isRecording: false,
  isProcessing: false,
  isLoading: false,
  transcription: "",
  response: "",
  error: null,
  recentCommands: [],
  recordingDuration: 0,
};

// Async thunks
export const processVoiceCommand = createAsyncThunk(
  "voice/processCommand",
  async (data: ProcessVoiceData, { rejectWithValue }) => {
    try {
      const response = await apiClient.uploadFile(
        API_ENDPOINTS.VOICE_PROCESS,
        data.audioFile
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to process voice command"
      );
    }
  }
);

export const transcribeAudio = createAsyncThunk(
  "voice/transcribeAudio",
  async (audioFile: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.uploadFile(
        API_ENDPOINTS.VOICE_TRANSCRIBE,
        audioFile
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to transcribe audio");
    }
  }
);

export const fetchRecentCommands = createAsyncThunk(
  "voice/fetchRecentCommands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/voice/commands");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch recent commands"
      );
    }
  }
);

// Voice slice
const voiceSlice = createSlice({
  name: "voice",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
      if (!action.payload) {
        state.recordingDuration = 0;
      }
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setTranscription: (state, action: PayloadAction<string>) => {
      state.transcription = action.payload;
    },
    setResponse: (state, action: PayloadAction<string>) => {
      state.response = action.payload;
    },
    updateRecordingDuration: (state, action: PayloadAction<number>) => {
      state.recordingDuration = action.payload;
    },
    addRecentCommand: (state, action: PayloadAction<VoiceCommand>) => {
      state.recentCommands.unshift(action.payload);
      // Keep only last 10 commands
      if (state.recentCommands.length > 10) {
        state.recentCommands = state.recentCommands.slice(0, 10);
      }
    },
    clearVoiceData: (state) => {
      state.transcription = "";
      state.response = "";
      state.error = null;
      state.recordingDuration = 0;
    },
    clearRecentCommands: (state) => {
      state.recentCommands = [];
    },
  },
  extraReducers: (builder) => {
    // Process Voice Command
    builder
      .addCase(processVoiceCommand.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(processVoiceCommand.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.response = action.payload.response;
        state.error = null;
      })
      .addCase(processVoiceCommand.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      });

    // Transcribe Audio
    builder
      .addCase(transcribeAudio.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(transcribeAudio.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.transcription = action.payload.transcription;
        state.error = null;
      })
      .addCase(transcribeAudio.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      });

    // Fetch Recent Commands
    builder
      .addCase(fetchRecentCommands.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentCommands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentCommands = action.payload;
        state.error = null;
      })
      .addCase(fetchRecentCommands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setRecording,
  setProcessing,
  setTranscription,
  setResponse,
  updateRecordingDuration,
  addRecentCommand,
  clearVoiceData,
  clearRecentCommands,
} = voiceSlice.actions;

export default voiceSlice.reducer;
