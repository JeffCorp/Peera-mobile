import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useVoicePermissions } from '../../hooks/useVoicePermissions';
import { voiceService } from '../../services/voiceService';

const { width } = Dimensions.get('window');

interface VoiceCommand {
  id: string;
  text: string;
  description: string;
  icon: string;
  color: string;
}

const VoiceScreen: React.FC = () => {
  const { permissions, requestPermissions } = useVoicePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [recentCommands, setRecentCommands] = useState<{
    id: string;
    text: string;
    response: string;
    timestamp: Date;
  }[]>([]);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Voice commands examples with colors
  const voiceCommands: VoiceCommand[] = [
    {
      id: '1',
      text: 'Schedule a meeting',
      description: 'Create a new calendar event',
      icon: 'calendar',
      color: '#6366F1',
    },
    {
      id: '2',
      text: 'Add expense',
      description: 'Log a new expense',
      icon: 'dollar-sign',
      color: '#8B5CF6',
    },
    {
      id: '3',
      text: 'Show my calendar',
      description: 'View today\'s events',
      icon: 'list',
      color: '#EC4899',
    },
    {
      id: '4',
      text: 'Call assistant',
      description: 'Get AI assistance',
      icon: 'mic',
      color: '#10B981',
    },
  ];

  useEffect(() => {
    // Fade in animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation when recording
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
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

      // Start wave animation
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [isRecording]);

  const startRecordingTimer = () => {
    recordingTimer.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      setError('');
      setIsProcessing(true);

      await voiceService.startRecording();
      setIsRecording(true);
      startRecordingTimer();
      setTranscription('');
      setAiResponse('');
    } catch (error) {
      setError('Recording failed');
      console.error('Recording error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsProcessing(true);

      const recording = await voiceService.stopRecording();
      setIsRecording(false);
      stopRecordingTimer();

      // Process the recording
      const transcriptionResult = await voiceService.transcribeAudio(recording);
      setTranscription(transcriptionResult.text || '');

      // Process with AI
      const aiResponse = await voiceService.processVoiceCommand(transcriptionResult.text || '');
      setAiResponse(aiResponse.response || '');

      // Add to recent commands
      setRecentCommands(prev => [{
        id: Date.now().toString(),
        text: transcriptionResult.text || '',
        response: aiResponse.response || '',
        timestamp: new Date(),
      }, ...prev.slice(0, 9)]);
    } catch (error) {
      setError('Failed to process recording');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartListening = async () => {
    try {
      setError('');
      setIsProcessing(true);

      await voiceService.startRecording();
      setIsListening(true);
      setTranscription('');
      setAiResponse('');
    } catch (error) {
      setError('Listening failed');
      console.error('Listening error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopListening = async () => {
    try {
      setIsProcessing(true);

      const recording = await voiceService.stopRecording();
      setIsListening(false);

      // Process the recording
      const transcriptionResult = await voiceService.transcribeAudio(recording);
      setTranscription(transcriptionResult.text || '');

      // Process with AI
      const aiResponse = await voiceService.processVoiceCommand(transcriptionResult.text || '');
      setAiResponse(aiResponse.response || '');

      // Add to recent commands
      setRecentCommands(prev => [{
        id: Date.now().toString(),
        text: transcriptionResult.text || '',
        response: aiResponse.response || '',
        timestamp: new Date(),
      }, ...prev.slice(0, 9)]);
    } catch (error) {
      setError('Failed to stop listening');
      console.error('Stop listening error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayRecording = async () => {
    try {
      const uri = voiceService.getCurrentRecordingUri();
      if (uri) {
        await voiceService.playRecording(uri);
      }
    } catch (error) {
      console.error('Play recording error:', error);
    }
  };

  const handleStopSpeaking = async () => {
    try {
      await voiceService.stopSpeaking();
    } catch (error) {
      console.error('Stop speaking error:', error);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const renderWaveAnimation = () => {
    const waves = [];
    for (let i = 0; i < 3; i++) {
      const waveScale = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.5 + i * 0.3],
      });
      const waveOpacity = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 0],
      });

      waves.push(
        <Animated.View
          key={i}
          style={[
            styles.wave,
            {
              transform: [{ scale: waveScale }],
              opacity: waveOpacity,
            },
          ]}
        />
      );
    }
    return waves;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Animated Background */}
      <View style={styles.backgroundGradient}>
        <View style={styles.floatingOrbs}>
          <View style={[styles.orb, styles.orb1]} />
          <View style={[styles.orb, styles.orb2]} />
          <View style={[styles.orb, styles.orb3]} />
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>🎤 Voice Assistant</Text>
            <Text style={styles.subtitle}>AI-powered voice commands</Text>
            <View style={styles.headerIcon}>
              <Ionicons name="mic" size={24} color="#6366F1" />
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.scrollInner,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Permission Status */}
            {permissions.loading ? (
              <View style={styles.permissionCard}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.permissionText}>Checking microphone permissions...</Text>
              </View>
            ) : !permissions.microphone ? (
              <View style={styles.permissionCard}>
                <View style={styles.permissionIconContainer}>
                  <Ionicons name="mic" size={24} color="#EF4444" />
                </View>
                <Text style={styles.permissionText}>Microphone access required</Text>
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermissions}
                >
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Voice Commands Examples */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Voice Commands</Text>
                <Text style={styles.sectionSubtitle}>Try these AI commands</Text>
              </View>
              <View style={styles.commandsList}>
                {voiceCommands.map((command, index) => (
                  <Animated.View
                    key={command.id}
                    style={[
                      styles.commandCard,
                      {
                        transform: [{
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                          })
                        }],
                        opacity: fadeAnim,
                      },
                    ]}
                  >
                    <View style={styles.commandContent}>
                      <View style={styles.commandIconContainer}>
                        {command.icon === 'dollar-sign' ? (
                          <FontAwesome5 name="dollar-sign" size={20} color={command.color} />
                        ) : command.icon === 'calendar' ? (
                          <Ionicons name="calendar" size={20} color={command.color} />
                        ) : command.icon === 'list' ? (
                          <Ionicons name="list" size={20} color={command.color} />
                        ) : (
                          <Ionicons name="mic" size={20} color={command.color} />
                        )}
                      </View>
                      <View style={styles.commandTextContainer}>
                        <Text style={styles.commandText}>{command.text}</Text>
                        <Text style={styles.commandDescription}>{command.description}</Text>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Voice Recording Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Voice Recording</Text>
                <Text style={styles.sectionSubtitle}>Record and process voice notes</Text>
              </View>
              <View style={styles.recordingSection}>
                <View style={styles.recordingContainer}>
                  <Animated.View
                    style={[
                      styles.recordingButton,
                      { transform: [{ scale: pulseAnim }] }
                    ]}
                  >
                    {isRecording && renderWaveAnimation()}
                    <TouchableOpacity
                      style={[
                        styles.recordButton,
                        isRecording && styles.recordButtonActive,
                        isProcessing && styles.recordButtonProcessing
                      ]}
                      onPress={isRecording ? handleStopRecording : handleStartRecording}
                      disabled={isProcessing}
                    >
                      <View style={[
                        styles.recordButtonContent,
                        { backgroundColor: isRecording ? '#EF4444' : '#6366F1' }
                      ]}>
                        {isProcessing ? (
                          <ActivityIndicator size="large" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.recordButtonText}>
                            {isRecording ? 'Stop' : 'Record'}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Animated.View>

                  {isRecording && (
                    <Animated.View style={styles.recordingInfo}>
                      <Text style={styles.recordingDuration}>
                        Recording: {formatDuration(recordingDuration)}
                      </Text>
                      <View style={styles.recordingIndicator}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.recordingStatus}>LIVE</Text>
                      </View>
                    </Animated.View>
                  )}

                  <Text style={styles.recordingDescription}>
                    Record voice notes and commands for AI processing
                  </Text>
                </View>
              </View>
            </View>

            {/* Live Assistant Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Live Assistant</Text>
                <Text style={styles.sectionSubtitle}>Real-time AI voice interaction</Text>
              </View>
              <View style={styles.assistantSection}>
                <TouchableOpacity
                  style={[
                    styles.listenButton,
                    isListening && styles.listenButtonActive,
                    isProcessing && styles.listenButtonProcessing
                  ]}
                  onPress={isListening ? handleStopListening : handleStartListening}
                  disabled={isProcessing}
                >
                  <View style={[
                    styles.listenButtonContent,
                    { backgroundColor: isListening ? '#F59E0B' : '#10B981' }
                  ]}>
                    {isProcessing ? (
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.listenButtonText}>
                        {isListening ? 'Stop Listening' : 'Start Listening'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.assistantDescription}>
                  Get real-time AI assistance through voice commands
                </Text>
              </View>
            </View>

            {/* Transcription Display */}
            {transcription && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Transcription</Text>
                  <Text style={styles.sectionSubtitle}>Your voice input</Text>
                </View>
                <View style={styles.transcriptionCard}>
                  <View style={styles.transcriptionContent}>
                    <Text style={styles.transcriptionText}>{transcription}</Text>
                    {voiceService.getCurrentRecordingUri() && (
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={handlePlayRecording}
                      >
                        <View style={styles.playButtonContent}>
                          <Text style={styles.playButtonText}>Play</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* AI Response Display */}
            {aiResponse && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>AI Response</Text>
                  <Text style={styles.sectionSubtitle}>Assistant reply</Text>
                </View>
                <View style={styles.responseCard}>
                  <View style={styles.responseContent}>
                    <Text style={styles.responseText}>{aiResponse}</Text>
                    <TouchableOpacity
                      style={styles.speakButton}
                      onPress={() => voiceService.speakText(aiResponse)}
                    >
                      <View style={styles.speakButtonContent}>
                        <Text style={styles.speakButtonText}>Speak</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Recent Commands */}
            {recentCommands.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Commands</Text>
                  <Text style={styles.sectionSubtitle}>Your voice history</Text>
                </View>
                <View style={styles.recentCommandsList}>
                  {recentCommands.map((command) => (
                    <View key={command.id} style={styles.recentCommandCard}>
                      <View style={styles.recentCommandHeader}>
                        <View style={styles.recentCommandIconContainer}>
                          <Ionicons name="mic" size={16} color="#6366F1" />
                        </View>
                        <Text style={styles.recentCommandText}>{command.text}</Text>
                        <Text style={styles.recentCommandTime}>
                          {formatTimeAgo(command.timestamp)}
                        </Text>
                      </View>
                      {command.response && (
                        <Text style={styles.recentCommandResponse}>{command.response}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Error Display */}
            {error && (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>Error: {error}</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0A0A',
  },
  floatingOrbs: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  orb1: {
    width: 200,
    height: 200,
    backgroundColor: '#6366F1',
    top: -50,
    right: -50,
  },
  orb2: {
    width: 150,
    height: 150,
    backgroundColor: '#8B5CF6',
    top: 200,
    left: -30,
  },
  orb3: {
    width: 100,
    height: 100,
    backgroundColor: '#EC4899',
    top: 400,
    right: 50,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '500',
    marginBottom: 16,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },

  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: 20,
    paddingBottom: 120, // Add space for the bottom tab bar
  },
  permissionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  permissionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  permissionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  commandsList: {
    gap: 12,
  },
  commandCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  commandContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  commandIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  commandTextContainer: {
    flex: 1,
  },
  commandText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  commandDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  recordingSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recordingContainer: {
    alignItems: 'center',
  },
  recordingButton: {
    position: 'relative',
    marginBottom: 20,
  },
  wave: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#6366F1',
    top: -10,
    left: -10,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  recordButtonActive: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  recordButtonProcessing: {
    opacity: 0.7,
  },
  recordButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingDuration: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 16,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  recordingStatus: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  recordingDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  assistantSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  listenButton: {
    width: '100%',
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  listenButtonActive: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  listenButtonProcessing: {
    opacity: 0.7,
  },
  listenButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listenButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assistantDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  transcriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transcriptionContent: {
    padding: 20,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 16,
  },
  playButton: {
    alignSelf: 'flex-start',
  },
  playButtonContent: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  responseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  responseContent: {
    padding: 20,
  },
  responseText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 16,
  },
  speakButton: {
    alignSelf: 'flex-start',
  },
  speakButtonContent: {
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  speakButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recentCommandsList: {
    gap: 12,
  },
  recentCommandCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recentCommandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentCommandIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentCommandText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  recentCommandTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recentCommandResponse: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
});

export default VoiceScreen; 