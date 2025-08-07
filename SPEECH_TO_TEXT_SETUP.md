# Speech-to-Text Setup Guide

## Overview

This guide explains how to implement real speech-to-text functionality in your React Native Expo app. Currently, the app uses a mock implementation, but you can easily integrate with real speech-to-text services.

## Available Options

### 1. **@react-native-voice/voice** (Recommended)

- **Pros**: Most popular, well-maintained, supports iOS and Android
- **Cons**: Requires ejecting from Expo or using development builds
- **Best for**: Production apps with real-time speech recognition

### 2. **Google Cloud Speech-to-Text API**

- **Pros**: High accuracy, supports many languages, cloud-based
- **Cons**: Requires API key, costs money, requires internet
- **Best for**: High-accuracy transcription needs

### 3. **Azure Speech Services**

- **Pros**: Good accuracy, Microsoft ecosystem integration
- **Cons**: Requires API key, costs money, requires internet
- **Best for**: Enterprise applications

### 4. **AWS Transcribe**

- **Pros**: Good accuracy, AWS ecosystem integration
- **Cons**: Requires API key, costs money, requires internet
- **Best for**: AWS-based applications

## Implementation Options

### Option 1: @react-native-voice/voice (Real-time)

#### Installation

```bash
npm install @react-native-voice/voice
```

#### For Expo Development Builds

```bash
npx expo install @react-native-voice/voice
npx expo run:ios  # or expo run:android
```

#### Implementation

```typescript
import Voice from "@react-native-voice/voice";

class VoiceService {
  private voice: any = null;

  constructor() {
    this.initializeVoiceRecognition();
  }

  private initializeVoiceRecognition() {
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechError = this.onSpeechError;
  }

  async startRealTimeRecognition(): Promise<void> {
    try {
      await Voice.start("en-US");
      console.log("Real-time speech recognition started");
    } catch (error) {
      console.error("Failed to start recognition:", error);
      throw error;
    }
  }

  async stopRealTimeRecognition(): Promise<void> {
    try {
      await Voice.stop();
      console.log("Real-time speech recognition stopped");
    } catch (error) {
      console.error("Failed to stop recognition:", error);
      throw error;
    }
  }

  private onSpeechStart = () => {
    console.log("Speech recognition started");
  };

  private onSpeechEnd = () => {
    console.log("Speech recognition ended");
  };

  private onSpeechResults = (event: any) => {
    const results = event.value;
    console.log("Speech results:", results);
    // Process the results
  };

  private onSpeechError = (event: any) => {
    console.error("Speech recognition error:", event.error);
  };
}
```

### Option 2: Google Cloud Speech-to-Text API

#### Installation

```bash
npm install @google-cloud/speech
```

#### Implementation

```typescript
import { SpeechClient } from "@google-cloud/speech";

class VoiceService {
  private speechClient: SpeechClient;

  constructor() {
    this.speechClient = new SpeechClient({
      keyFilename: "path/to/your/service-account-key.json",
      // Or use environment variable:
      // credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
    });
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<TranscriptionResult> {
    try {
      const request = {
        audio: {
          content: audioBuffer.toString("base64"),
        },
        config: {
          encoding: "LINEAR16",
          sampleRateHertz: 16000,
          languageCode: "en-US",
        },
      };

      const [response] = await this.speechClient.recognize(request);
      const transcription = response.results
        ?.map((result) => result.alternatives?.[0]?.transcript)
        .join("\n");

      return {
        text: transcription || "",
        confidence: response.results?.[0]?.alternatives?.[0]?.confidence || 0,
        language: "en-US",
      };
    } catch (error) {
      console.error("Transcription failed:", error);
      throw error;
    }
  }
}
```

### Option 3: Azure Speech Services

#### Installation

```bash
npm install microsoft-cognitiveservices-speech-sdk
```

#### Implementation

```typescript
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

class VoiceService {
  private speechConfig: SpeechSDK.SpeechConfig;

  constructor() {
    this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      "YOUR_AZURE_KEY",
      "YOUR_AZURE_REGION"
    );
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<TranscriptionResult> {
    return new Promise((resolve, reject) => {
      const audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(audioBuffer);
      const recognizer = new SpeechSDK.SpeechRecognizer(
        this.speechConfig,
        audioConfig
      );

      recognizer.recognizeOnceAsync(
        (result) => {
          const transcription = result.text;
          const confidence = result.properties.getProperty(
            SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult
          );

          resolve({
            text: transcription,
            confidence: confidence ? JSON.parse(confidence).confidence : 0,
            language: "en-US",
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
}
```

## Current Implementation Status

### ✅ What's Working

- **Voice recording** with `expo-av`
- **Permission handling** for microphone access
- **UI components** for voice input
- **Command processing** with intelligent parsing
- **Mock transcription** for testing

### 🔄 What Needs to be Added

- **Real speech-to-text service** integration
- **Real-time transcription** capabilities
- **Error handling** for STT service failures
- **Offline fallback** options

## Recommended Implementation Path

### Phase 1: Development/Testing

1. Use the current mock implementation for development
2. Test voice command parsing and UI
3. Validate user experience

### Phase 2: Production Implementation

1. Choose a speech-to-text service based on your needs
2. Implement the chosen service
3. Add proper error handling and fallbacks
4. Test with real users

### Phase 3: Optimization

1. Add real-time transcription
2. Implement caching for better performance
3. Add support for multiple languages
4. Optimize for accuracy and speed

## Configuration Examples

### Environment Variables

```env
# Google Cloud
GOOGLE_CLOUD_CREDENTIALS={"type":"service_account",...}

# Azure Speech
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=your_azure_region

# AWS Transcribe
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
```

### App Configuration

```typescript
// src/config/speech.ts
export const SPEECH_CONFIG = {
  provider: "google", // 'google', 'azure', 'aws', 'voice'
  language: "en-US",
  enableRealTime: true,
  enableOffline: false,
  maxDuration: 30000, // 30 seconds
  confidenceThreshold: 0.7,
};
```

## Testing Voice Commands

### Event Creation Commands

```
"Title team meeting, description weekly standup, location conference room, time 2 PM tomorrow"
"Event client call at 3 PM today in virtual meeting"
"Meeting budget review all day tomorrow"
"Schedule appointment with John at 10 AM on Friday"
```

### Expense Commands

```
"Add expense $25 for lunch"
"Spent $15 on coffee"
"Expense $50 for dinner at restaurant"
```

### Navigation Commands

```
"Show calendar"
"Open expenses"
"Go to home"
"View profile"
```

## Troubleshooting

### Common Issues

1. **Permission denied**: Check microphone permissions
2. **No audio input**: Verify device microphone is working
3. **Poor transcription**: Check audio quality and background noise
4. **Service errors**: Verify API keys and network connectivity

### Debug Tips

1. Enable console logging for voice events
2. Test with simple commands first
3. Check audio recording quality
4. Verify service credentials

## Next Steps

1. **Choose your speech-to-text provider** based on your requirements
2. **Install the necessary packages** for your chosen solution
3. **Update the VoiceService** to use real transcription
4. **Test thoroughly** with real voice input
5. **Deploy and monitor** performance in production

The current implementation provides a solid foundation for voice input functionality. Once you choose and implement a real speech-to-text service, you'll have a fully functional voice-controlled app!
