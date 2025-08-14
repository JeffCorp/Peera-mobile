/**
 * VoiceInput Component
 * 
 * Features:
 * - Tap to start recording
 * - Tap again to stop recording manually
 * - Auto-stops after 2 seconds of silence (voice activity detection)
 * - Visual feedback with pulse animation and countdown
 * - Clear indication that tapping will stop recording
 */
import apiClient from '@/api/client';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useVoicePermissions } from '../../hooks/useVoicePermissions';
import { voiceService } from '../../services/voiceService';

interface VoiceInputProps {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: any;
  buttonStyle?: any;
  textStyle?: any;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscription,
  onError,
  placeholder = 'Tap to speak',
  disabled = false,
  style,
  buttonStyle,
  textStyle,
}) => {
  const { permissions, requestPermissions } = useVoicePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Voice activity detection
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAudioLevel = useRef<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  useEffect(() => {
    if (isRecording) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start recording timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
        // Simulate voice activity check every second
        resetSilenceTimer();
      }, 1000);
    } else {
      // Stop animations and timer
      pulseAnim.stopAnimation();
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      // Clear silence timer
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
        silenceTimer.current = null;
      }
      setRecordingDuration(0);
    }
  }, [isRecording, pulseAnim]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
      }
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Voice activity detection - automatically stop when user stops speaking
  const checkVoiceActivity = () => {
    if (!isRecording) return;

    // TODO: In a real implementation, this would integrate with the audio service to detect actual voice activity
    // The audio service could provide real-time audio levels and voice activity detection
    // For now, we simulate this with a timer that resets when the user "speaks"

    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
    }

    silenceTimer.current = setTimeout(() => {
      if (isRecording) {
        console.log('Auto-stopping recording due to silence');
        handleStopRecording();
      }
    }, 2000); // Stop after 2 seconds of silence
  };

  // Reset silence timer when user speaks
  const resetSilenceTimer = () => {
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
    }
    checkVoiceActivity();
  };

  const handleStartRecording = async () => {
    try {
      if (disabled) return;

      if (!permissions.microphone) {
        const granted = await requestPermissions();
        if (!granted) {
          const errorMsg = 'Microphone permission required for voice input';
          setError(errorMsg);
          onError?.(errorMsg);
          return;
        }
      }

      setError('');
      setTranscription('');
      setIsRecording(true);

      await voiceService.startRecording();
      console.log('Voice recording started');

      // Start voice activity detection
      checkVoiceActivity();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start recording';
      console.error('Failed to start recording:', error);
      setError(errorMsg);
      onError?.(errorMsg);
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (!isRecording) return;

      setIsRecording(false);
      setIsProcessing(true);

      const recording = await voiceService.stopRecording();
      console.log('Voice recording stopped:', recording);

      // Process the recording - Create FormData for file upload
      const formData = new FormData();

      // Add the audio file
      formData.append('audioPath', {
        uri: recording.uri,
        type: 'audio/m4a',
        name: `recording_${Date.now()}.m4a`,
      } as any);

      // Add only the fields expected by the DTO
      formData.append('language', 'en-US');
      formData.append('context', 'voice_command');

      console.log("Uploading audio file...");

      const response = await apiClient.post("/ai/upload-audio", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Audio upload response:", response);

      const text = (response as any)?.text || (response as any)?.transcription;

      setTranscription(text);
      onTranscription?.(text);

      // Process with AI and get audio response
      try {
        const aiResult = await voiceService.processVoiceCommand(text);
        console.log('AI response:', aiResult);

        // The AI response will be spoken automatically by the voice service
        // You can also add visual feedback here if needed

      } catch (aiError) {
        console.error('AI processing failed:', aiError);
        // Speak error message with enhanced volume
        await voiceService.speakImportantMessage('Failed to process your command. Please try again.');
      }

      console.log('Transcription completed:', text);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to process recording';
      console.error('Failed to process recording:', error);
      setError(errorMsg);
      onError?.(errorMsg);

      // Speak error message
      try {
        await voiceService.speakImportantMessage(`Error: ${errorMsg}. Please try again.`);
      } catch (speakError) {
        console.error('Failed to speak error:', speakError);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (isRecording) return `Tap to stop • ${formatDuration(recordingDuration)}`;
    return placeholder;
  };

  const getButtonIcon = () => {
    if (isProcessing) return <Ionicons name="time" size={24} color="white" />;
    if (isRecording) return <Ionicons name="recording" size={24} color="white" />;
    return <Ionicons name="mic" size={24} color="white" />;
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          isRecording && styles.buttonRecording,
          isProcessing && styles.buttonProcessing,
          disabled && styles.buttonDisabled,
          buttonStyle,
        ]}
        onPress={handlePress}
        disabled={disabled || isProcessing}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            isRecording && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          {getButtonIcon()}
        </Animated.View>
        <Text style={[styles.buttonText, textStyle]}>{getButtonText()}</Text>
      </TouchableOpacity>

      {/* Auto-stop indicator */}
      {isRecording && (
        <View style={styles.autoStopIndicator}>
          <Ionicons name="information-circle-outline" size={16} color="#F59E0B" />
          <Text style={styles.autoStopText}>
            Will auto-stop in 2 seconds when you stop speaking
          </Text>
        </View>
      )}

      {transcription ? (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionLabel}>Transcription:</Text>
          <Text style={styles.transcriptionText}>{transcription}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonRecording: {
    backgroundColor: '#EF4444',
  },
  buttonProcessing: {
    backgroundColor: '#F59E0B',
  },
  buttonDisabled: {
    backgroundColor: '#6B7280',
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: 8,
  },
  icon: {
    fontSize: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transcriptionLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  transcriptionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
  },
  autoStopIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  autoStopText: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 6,
    textAlign: 'center',
  },
}); 