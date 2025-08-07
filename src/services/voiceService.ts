import apiClient from "@/api/client";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
// Note: You'll need to install @react-native-voice/voice
// npm install @react-native-voice/voice
// import Voice from '@react-native-voice/voice';

export interface VoiceRecording {
  uri: string;
  duration: number;
  size: number;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language?: string;
}

export interface AIResponse {
  response: string;
  action?: string;
  data?: any;
}

export interface VoiceServiceError {
  code: string;
  message: string;
  details?: any;
}

export interface UploadAudioDto {
  audioPath: string;
  fileName?: string;
  fileSize?: number;
  language?: string;
  context?: string;
}

export interface UploadAudioResponse {
  success: boolean;
  message: string;
  data?: {
    transcription?: string;
    confidence?: number;
    language?: string;
    aiResponse?: any;
  };
  error?: string;
}

class VoiceService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private isRecording = false;
  private recordingUri: string | null = null;
  // private voice: any = null; // Will be initialized when package is installed

  constructor() {
    // Initialize voice recognition when package is available
    // this.initializeVoiceRecognition();
  }

  // private async initializeVoiceRecognition() {
  //   try {
  //     // This will be uncommented when @react-native-voice/voice is installed
  //     // this.voice = Voice;
  //     // await this.voice.onSpeechStart = this.onSpeechStart;
  //     // await this.voice.onSpeechEnd = this.onSpeechEnd;
  //     // await this.voice.onSpeechResults = this.onSpeechResults;
  //     // await this.voice.onSpeechError = this.onSpeechError;
  //   } catch (error) {
  //     console.error('Failed to initialize voice recognition:', error);
  //   }
  // }

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Microphone permission not granted");
      }
      return true;
    } catch (error) {
      console.error("Permission request failed:", error);
      return false;
    }
  }

  /**
   * Check if microphone permissions are granted
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.getPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Permission check failed:", error);
      return false;
    }
  }

  /**
   * Start voice recording with real-time speech recognition
   */
  async startRecording(): Promise<void> {
    try {
      // Check permissions first
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error("Microphone permission required");
        }
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;

      // Start real-time speech recognition if available
      // await this.startVoiceRecognition();

      console.log("Recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw new Error(
        `Recording failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // private async startVoiceRecognition() {
  //   try {
  //     if (this.voice) {
  //       await this.voice.start('en-US');
  //       console.log('Voice recognition started');
  //     }
  //   } catch (error) {
  //     console.error('Failed to start voice recognition:', error);
  //   }
  // }

  /**
   * Stop voice recording
   */
  async stopRecording(): Promise<VoiceRecording> {
    try {
      if (!this.recording || !this.isRecording) {
        throw new Error("No active recording");
      }

      // Stop real-time speech recognition if available
      // await this.stopVoiceRecognition();

      // Stop recording
      await this.recording.stopAndUnloadAsync();
      this.isRecording = false;

      // Get recording info
      const uri = this.recording.getURI();
      if (!uri) {
        throw new Error("Failed to get recording URI");
      }

      const status = await this.recording.getStatusAsync();
      const duration = status.durationMillis || 0;
      const size = (status as any).fileSize || 0;

      this.recordingUri = uri;
      this.recording = null;

      console.log("Recording stopped");

      return {
        uri,
        duration,
        size,
      };
    } catch (error) {
      console.error("Failed to stop recording:", error);
      throw new Error(
        `Failed to stop recording: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // private async stopVoiceRecognition() {
  //   try {
  //     if (this.voice) {
  //       await this.voice.stop();
  //       console.log('Voice recognition stopped');
  //     }
  //   } catch (error) {
  //     console.error('Failed to stop voice recognition:', error);
  //   }
  // }

  /**
   * Convert speech to text using real speech-to-text service
   * This will use a proper STT service when implemented
   */
  async transcribeAudio(
    recording: VoiceRecording
  ): Promise<TranscriptionResult> {
    try {
      // TODO: Implement real speech-to-text service
      // Options:
      // 1. Use @react-native-voice/voice for real-time transcription
      // 2. Use Google Cloud Speech-to-Text API
      // 3. Use Azure Speech Services
      // 4. Use AWS Transcribe

      // For now, using mock implementation
      // In production, you would:
      // 1. Send the audio file to a speech-to-text service
      // 2. Get back the transcription with confidence scores
      // 3. Return the structured result

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock transcription results based on common voice commands
      const mockTranscriptions = [
        { text: "Schedule a meeting for tomorrow at 2 PM", confidence: 0.95 },
        { text: "Add expense for lunch $25", confidence: 0.92 },
        { text: "Show my calendar for today", confidence: 0.88 },
        { text: "Call assistant", confidence: 0.9 },
        { text: "Create a new task", confidence: 0.87 },
        {
          text: "Title team meeting, description weekly standup, location conference room, time 2 PM tomorrow",
          confidence: 0.93,
        },
        {
          text: "Event client call at 3 PM today in virtual meeting",
          confidence: 0.91,
        },
        { text: "Meeting budget review all day tomorrow", confidence: 0.89 },
      ];

      const randomIndex = Math.floor(Math.random() * mockTranscriptions.length);
      const result = mockTranscriptions[randomIndex];

      console.log("Transcription completed:", result);

      return {
        text: result.text,
        confidence: result.confidence,
        language: "en-US",
      };
    } catch (error) {
      console.error("Transcription failed:", error);
      throw new Error(
        `Transcription failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Real-time speech recognition (when @react-native-voice/voice is installed)
   */
  // async startRealTimeRecognition(): Promise<void> {
  //   try {
  //     if (!this.voice) {
  //       throw new Error('Voice recognition not available');
  //     }
  //
  //     await this.voice.start('en-US');
  //     console.log('Real-time speech recognition started');
  //   } catch (error) {
  //     console.error('Failed to start real-time recognition:', error);
  //     throw error;
  //   }
  // }

  // async stopRealTimeRecognition(): Promise<void> {
  //   try {
  //     if (this.voice) {
  //       await this.voice.stop();
  //       console.log('Real-time speech recognition stopped');
  //     }
  //   } catch (error) {
  //     console.error('Failed to stop real-time recognition:', error);
  //     throw error;
  //   }
  // }

  /**
   * Process voice command with AI and return audio response
   */
  async processVoiceCommand(transcription: string): Promise<AIResponse> {
    try {
      // Mock AI processing - in real app, send to OpenAI or similar service
      // await new Promise((resolve) => setTimeout(resolve, 1500));
      const response: any = await apiClient.post("ai/create-event", {
        text: transcription,
      });

      // const text = transcription.text.toLowerCase();
      // let response: AIResponse;

      // if (text.includes("schedule") || text.includes("meeting")) {
      //   response = {
      //     response: "I'll help you schedule a meeting. Opening the calendar...",
      //     action: "open_calendar",
      //     data: { type: "meeting", text: transcription.text },
      //   };
      // } else if (text.includes("expense") || text.includes("add expense")) {
      //   response = {
      //     response:
      //       "I'll help you add an expense. Opening the expenses screen...",
      //     action: "open_expenses",
      //     data: { type: "expense", text: transcription.text },
      //   };
      // } else if (text.includes("calendar") || text.includes("show")) {
      //   response = {
      //     response: "Here's your calendar for today.",
      //     action: "show_calendar",
      //     data: { type: "view", text: transcription.text },
      //   };
      // } else if (text.includes("assistant") || text.includes("call")) {
      //   response = {
      //     response: "Hello! I'm your AI assistant. How can I help you today?",
      //     action: "assistant_mode",
      //     data: { type: "assistant", text: transcription.text },
      //   };
      // } else {
      //   response = {
      //     response:
      //       'I heard you say: "' +
      //       transcription.text +
      //       '". How can I help you with that?',
      //     action: "general_query",
      //     data: { type: "query", text: transcription.text },
      //   };
      // }

      console.log("response", response);

      console.log("AI processing completed:", response.data);

      // Speak the AI response
      if (response && response?.response) {
        console.log("Speaking AI response:", response?.response);

        await this.speakTextWithEnhancedVolume(response?.response);
      }

      return response.data;
    } catch (error) {
      console.error("AI processing failed:", error);
      throw new Error(
        `AI processing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Speak text using text-to-speech with enhanced options
   */
  async speakText(
    text: string,
    options?: {
      language?: string;
      pitch?: number;
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<void> {
    try {
      // Configure audio mode for better volume
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false, // Don't reduce volume
        playThroughEarpieceAndroid: false, // Use speaker instead of earpiece
      });

      const speakOptions = {
        language: options?.language || "en-US",
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.75,
      };

      // Call onStart callback if provided
      options?.onStart?.();

      await Speech.speak(text, speakOptions);
      console.log("Speaking text:", text);

      // Note: expo-speech doesn't support event listeners
      // The speech will complete automatically
      // You can use setTimeout to approximate onEnd callback
      setTimeout(() => {
        console.log("Speech ended");
        options?.onEnd?.();
      }, text.length * 100); // Rough estimate based on text length
    } catch (error) {
      console.error("Failed to speak text:", error);
      options?.onError?.(
        error instanceof Error ? error.message : "Failed to speak text"
      );
      throw new Error(
        `Failed to speak text: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Speak AI response with natural language processing
   */
  async speakAIResponse(
    aiResponse: AIResponse,
    options?: {
      language?: string;
      pitch?: number;
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<void> {
    try {
      let responseText = aiResponse.response;

      // Enhance the response text for better TTS
      if (aiResponse.action) {
        switch (aiResponse.action) {
          case "open_calendar":
            responseText = `I'll help you schedule a meeting. Opening the calendar now.`;
            break;
          case "open_expenses":
            responseText = `I'll help you add an expense. Opening the expenses screen now.`;
            break;
          case "show_calendar":
            responseText = `Here's your calendar for today.`;
            break;
          case "assistant_mode":
            responseText = `Hello! I'm your AI assistant. How can I help you today?`;
            break;
          default:
            responseText = aiResponse.response;
        }
      }

      const speakOptions: any = {
        language: options?.language || "en-US",
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.75,
      };

      if (options?.onStart) speakOptions.onStart = options.onStart;
      if (options?.onEnd) speakOptions.onEnd = options.onEnd;
      if (options?.onError) speakOptions.onError = options.onError;

      await this.speakText(responseText, speakOptions);
    } catch (error) {
      console.error("Failed to speak AI response:", error);
      options?.onError?.(
        error instanceof Error ? error.message : "Failed to speak AI response"
      );
    }
  }

  /**
   * Speak confirmation for successful actions
   */
  async speakConfirmation(
    action: string,
    details?: string,
    options?: {
      language?: string;
      pitch?: number;
      rate?: number;
    }
  ): Promise<void> {
    const confirmationText = details
      ? `${action} completed successfully. ${details}`
      : `${action} completed successfully.`;

    await this.speakText(confirmationText, {
      language: options?.language || "en-US",
      pitch: options?.pitch || 1.0,
      rate: options?.rate || 0.8,
    });
  }

  /**
   * Speak error messages
   */
  async speakError(
    error: string,
    options?: {
      language?: string;
      pitch?: number;
      rate?: number;
    }
  ): Promise<void> {
    const errorText = `Sorry, I encountered an error. ${error}`;

    await this.speakText(errorText, {
      language: options?.language || "en-US",
      pitch: options?.pitch || 0.9, // Slightly lower pitch for errors
      rate: options?.rate || 0.7, // Slightly slower for clarity
    });
  }

  /**
   * Speak welcome message
   */
  async speakWelcome(options?: {
    language?: string;
    pitch?: number;
    rate?: number;
  }): Promise<void> {
    const welcomeText =
      "Hello! I'm your voice assistant. How can I help you today?";

    await this.speakText(welcomeText, {
      language: options?.language || "en-US",
      pitch: options?.pitch || 1.0,
      rate: options?.rate || 0.75,
    });
  }

  /**
   * Speak listening prompt
   */
  async speakListeningPrompt(options?: {
    language?: string;
    pitch?: number;
    rate?: number;
  }): Promise<void> {
    const promptText = "I'm listening. Please speak your command.";

    await this.speakText(promptText, {
      language: options?.language || "en-US",
      pitch: options?.pitch || 1.0,
      rate: options?.rate || 0.8,
    });
  }

  /**
   * Stop speaking
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
      console.log("Stopped speaking");
    } catch (error) {
      console.error("Failed to stop speaking:", error);
    }
  }

  /**
   * Configure audio settings for optimal TTS volume
   */
  async configureAudioForTTS(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false, // Don't reduce volume
        playThroughEarpieceAndroid: false, // Use speaker instead of earpiece
      });
      console.log("Audio configured for TTS");
    } catch (error) {
      console.error("Failed to configure audio for TTS:", error);
    }
  }

  /**
   * Speak text with enhanced volume and clarity
   */
  async speakTextWithEnhancedVolume(
    text: string,
    options?: {
      language?: string;
      pitch?: number;
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<void> {
    try {
      // Configure audio for better volume
      await this.configureAudioForTTS();

      const speakOptions = {
        language: options?.language || "en-US",
        pitch: options?.pitch || 1.1, // Slightly higher pitch for better clarity
        rate: options?.rate || 0.7, // Slightly slower for better understanding
      };

      // Call onStart callback if provided
      options?.onStart?.();

      await Speech.speak(text, speakOptions);
      console.log("Speaking text with enhanced volume:", text);

      // Estimate speech duration for callback
      const estimatedDuration = Math.max(text.length * 80, 1000); // Minimum 1 second
      setTimeout(() => {
        console.log("Enhanced speech ended");
        options?.onEnd?.();
      }, estimatedDuration);
    } catch (error) {
      console.error("Failed to speak text with enhanced volume:", error);
      options?.onError?.(
        error instanceof Error ? error.message : "Failed to speak text"
      );
      throw new Error(
        `Failed to speak text: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Speak important messages with maximum clarity
   */
  async speakImportantMessage(
    text: string,
    options?: {
      language?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<void> {
    try {
      // Configure audio for maximum volume
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true, // Keep audio active
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      const speakOptions = {
        language: options?.language || "en-US",
        pitch: 1.2, // Higher pitch for importance
        rate: 0.65, // Slower rate for clarity
      };

      options?.onStart?.();

      await Speech.speak(text, speakOptions);
      console.log("Speaking important message:", text);

      const estimatedDuration = Math.max(text.length * 90, 1500);
      setTimeout(() => {
        console.log("Important message speech ended");
        options?.onEnd?.();
      }, estimatedDuration);
    } catch (error) {
      console.error("Failed to speak important message:", error);
      options?.onError?.(
        error instanceof Error
          ? error.message
          : "Failed to speak important message"
      );
    }
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get current recording URI
   */
  getCurrentRecordingUri(): string | null {
    return this.recordingUri;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.recording && this.isRecording) {
        await this.stopRecording();
      }
      if (this.sound) {
        await this.stopPlaying();
      }
      await this.stopSpeaking();
    } catch (error) {
      console.error("Cleanup failed:", error);
    }
  }

  /**
   * Play recorded audio
   */
  async playRecording(uri: string): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      this.sound = sound;

      await this.sound.playAsync();
      console.log("Playing recording");
    } catch (error) {
      console.error("Failed to play recording:", error);
      throw new Error(
        `Failed to play recording: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Stop playing audio
   */
  async stopPlaying(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error("Failed to stop playing:", error);
    }
  }

  /**
   * Upload audio file to AI endpoint for processing
   */
  async uploadAudio(
    recording: VoiceRecording,
    options?: {
      fileName?: string;
      language?: string;
      context?: string;
    }
  ): Promise<UploadAudioResponse> {
    try {
      console.log("Uploading audio to AI endpoint...");

      // Create FormData for file upload
      const formData = new FormData();

      const fileName = options?.fileName || `recording_${Date.now()}.m4a`;

      // Add the audio file
      formData.append("audioPath", {
        uri: recording.uri,
        type: "audio/m4a",
        name: fileName,
      } as any);

      // Add only the fields expected by the DTO
      formData.append("language", options?.language || "en-US");
      formData.append("context", options?.context || "voice_command");

      console.log("Uploading audio file with FormData...");

      const response = await apiClient.post("/ai/upload-audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Audio upload response:", response);

      return {
        success: true,
        message: "Audio uploaded successfully",
        data: response.data,
      };
    } catch (error) {
      console.error("Audio upload failed:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        success: false,
        message: "Audio upload failed",
        error: errorMessage,
      };
    }
  }

  /**
   * Enhanced transcribe audio that uses the upload endpoint
   */
  async transcribeAudioWithUpload(
    recording: VoiceRecording,
    options?: {
      language?: string;
      context?: string;
    }
  ): Promise<TranscriptionResult> {
    try {
      console.log("Transcribing audio with upload...");

      const uploadResponse = await this.uploadAudio(recording, {
        language: options?.language || "en-US",
        context: options?.context || "transcription",
      });

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || "Upload failed");
      }

      const { data } = uploadResponse;

      if (!data?.transcription) {
        throw new Error("No transcription received from server");
      }

      return {
        text: data.transcription,
        confidence: data.confidence || 0.8,
        language: data.language || "en-US",
      };
    } catch (error) {
      console.error("Transcription with upload failed:", error);

      // Fallback to local transcription if upload fails
      console.log("Falling back to local transcription...");
      return this.transcribeAudio(recording);
    }
  }
}

export const voiceService = new VoiceService();
export default voiceService;
