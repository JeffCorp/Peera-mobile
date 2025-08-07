import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { VoiceInput } from '../../components/voice/VoiceInput';
import { useAuth } from '../../contexts/AuthContext';
import { voiceService } from '../../services/voiceService';

const { width, height } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  time: string;
  location?: string;
  type: 'meeting' | 'call' | 'task';
}

interface QuickStats {
  meetingsToday: number;
  expensesThisWeek: number;
  totalEvents: number;
}

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Mock data - replace with real data from your backend
  const [todayEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Team Standup',
      time: '09:00 AM',
      location: 'Conference Room A',
      type: 'meeting'
    },
    {
      id: '2',
      title: 'Client Presentation',
      time: '02:30 PM',
      location: 'Virtual Meeting',
      type: 'call'
    },
    {
      id: '3',
      title: 'Review Q4 Budget',
      time: '04:00 PM',
      location: 'Office',
      type: 'task'
    }
  ]);

  const [quickStats] = useState<QuickStats>({
    meetingsToday: 3,
    expensesThisWeek: 1250,
    totalEvents: 12
  });

  // Animate on mount
  useEffect(() => {
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
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleVoiceTranscription = async (text: string) => {
    setVoiceCommand(text);
    const lowerText = text.toLowerCase();

    try {
      // Process voice commands with audio feedback
      // if (lowerText.includes('schedule') || lowerText.includes('meeting') || lowerText.includes('event')) {
      //   await voiceService.speakConfirmation('Opening calendar', 'to schedule your event');
      //   Alert.alert('Voice Command', 'Opening calendar to schedule event...');
      //   // Navigate to calendar
      // } else if (lowerText.includes('expense') || lowerText.includes('add expense')) {
      //   await voiceService.speakConfirmation('Opening expenses', 'to add new expense');
      //   Alert.alert('Voice Command', 'Opening expenses to add new expense...');
      //   // Navigate to expenses
      // } else if (lowerText.includes('calendar') || lowerText.includes('show schedule')) {
      //   await voiceService.speakConfirmation('Showing calendar', 'for today');
      //   Alert.alert('Voice Command', 'Showing your calendar...');
      //   // Navigate to calendar
      // } else if (lowerText.includes('logout') || lowerText.includes('sign out')) {
      //   await voiceService.speakConfirmation('Logging out', 'see you next time');
      //   Alert.alert('Voice Command', 'Logging you out...');
      //   handleLogout();
      // } else {
      //   await voiceService.speakText(`I heard: "${text}". How can I help you with that?`);
      //   Alert.alert('Voice Command', `I heard: "${text}". How can I help you with that?`);
      // }
    } catch (error) {
      console.error('Voice command processing failed:', error);
      await voiceService.speakError('Failed to process your command');
      Alert.alert('Voice Command Error', 'Failed to process your command');
    }
  };

  const handleVoiceError = (error: string) => {
    Alert.alert('Voice Input Error', error);
  };

  const handleQuickAction = (action: string) => {
    Alert.alert('Quick Action', `${action} - This will be implemented`);
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      console.log('Logged out successfully');
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Ionicons name="people" size={20} color="#6366F1" />;
      case 'call': return <Ionicons name="call" size={20} color="#6366F1" />;
      case 'task': return <Ionicons name="checkmark-circle" size={20} color="#6366F1" />;
      default: return <Ionicons name="calendar" size={20} color="#6366F1" />;
    }
  };

  console.log("HomeScreen - User:", user);
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header with Greeting */}
          <View style={styles.header}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.fullName || 'User'}!</Text>
              <Text style={styles.welcomeText}>Your AI assistant is ready to help</Text>
            </View>
            <View style={styles.timeContainer}>
              <View style={styles.timeCard}>
                <Text style={styles.time}>{formatTime(currentTime)}</Text>
                <Text style={styles.date}>{formatDate(currentTime)}</Text>
              </View>
            </View>
          </View>

          {/* AI Status Indicator */}
          <View style={styles.aiStatusContainer}>
            <View style={styles.aiStatusCard}>
              <View style={styles.aiStatusIndicator}>
                <View style={styles.aiPulse} />
                <View style={styles.aiDot} />
              </View>
              <View style={styles.aiStatusText}>
                <Text style={styles.aiStatusTitle}>Smart Assistant</Text>
                <Text style={styles.aiStatusSubtitle}>Active & Ready</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today&apos;s Overview</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="analytics" size={20} color="#6366F1" />
                </View>
                <Text style={styles.statNumber}>{quickStats.meetingsToday}</Text>
                <Text style={styles.statLabel}>Meetings</Text>
                <Text style={styles.statSubtext}>Today</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <FontAwesome5 name="dollar-sign" size={20} color="#6366F1" />
                </View>
                <Text style={styles.statNumber}>${quickStats.expensesThisWeek}</Text>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={styles.statSubtext}>This Week</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="calendar" size={20} color="#6366F1" />
                </View>
                <Text style={styles.statNumber}>{quickStats.totalEvents}</Text>
                <Text style={styles.statLabel}>Events</Text>
                <Text style={styles.statSubtext}>Total</Text>
              </View>
            </View>
          </View>

          {/* Voice Input Button */}
          <View style={styles.section}>
            <View style={styles.voiceSectionHeader}>
              <Text style={styles.voiceSectionTitle}>AI Voice Assistant</Text>
              <Text style={styles.voiceSectionSubtitle}>Speak naturally to interact</Text>
            </View>
            <View style={styles.voiceInputWrapper}>
              <VoiceInput
                onTranscription={handleVoiceTranscription}
                onError={handleVoiceError}
                placeholder="Tap to speak commands"
                style={styles.voiceInputContainer}
                buttonStyle={styles.voiceButton}
              />
            </View>
            {voiceCommand ? (
              <View style={styles.voiceCommandContainer}>
                <View style={styles.voiceCommandHeader}>
                  <Text style={styles.voiceCommandLabel}>
                    <Ionicons name="mic" size={16} color="#6366F1" /> Last Command
                  </Text>
                </View>
                <Text style={styles.voiceCommandText}>{voiceCommand}</Text>
              </View>
            ) : null}
          </View>

          {/* Today's Schedule */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today&apos;s Schedule</Text>
              <TouchableOpacity onPress={() => handleQuickAction('View Full Schedule')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.scheduleContainer}>
              {todayEvents.length > 0 ? (
                todayEvents.map((event, index) => (
                  <View key={event.id} style={styles.eventCard}>
                    <View style={styles.eventIcon}>
                      {getEventIcon(event.type)}
                    </View>
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventTime}>{event.time}</Text>
                      {event.location && (
                        <Text style={styles.eventLocation}>{event.location}</Text>
                      )}
                    </View>
                    <View style={styles.eventStatus}>
                      <View style={styles.eventStatusDot} />
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateText}>No events scheduled for today</Text>
                  <Text style={styles.emptyStateSubtext}>Tap &quot;Add Event&quot; to get started</Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleQuickAction('Add Event')}
              >
                <View style={styles.quickActionGradient}>
                  <Ionicons name="add-circle" size={32} color="#6366F1" />
                  <Text style={styles.quickActionTitle}>Add Event</Text>
                  <Text style={styles.quickActionSubtitle}>Schedule meeting</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleQuickAction('Add Expense')}
              >
                <View style={styles.quickActionGradient}>
                  <FontAwesome5 name="plus-circle" size={32} color="#6366F1" />
                  <Text style={styles.quickActionTitle}>Add Expense</Text>
                  <Text style={styles.quickActionSubtitle}>Track spending</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleQuickAction('View Schedule')}
              >
                <View style={styles.quickActionGradient}>
                  <Ionicons name="list" size={32} color="#6366F1" />
                  <Text style={styles.quickActionTitle}>View Schedule</Text>
                  <Text style={styles.quickActionSubtitle}>Full calendar</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleQuickAction('Analytics')}
              >
                <View style={styles.quickActionGradient}>
                  <Ionicons name="analytics" size={32} color="#6366F1" />
                  <Text style={styles.quickActionTitle}>Analytics</Text>
                  <Text style={styles.quickActionSubtitle}>Insights & trends</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120, // Add space for the bottom tab bar
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    marginHorizontal: -20,
    marginTop: -20,
  },
  greetingContainer: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 18,
    color: '#E5E7EB',
    opacity: 0.8,
    fontWeight: '500',
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    backdropFilter: 'blur(10px)',
  },
  time: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  date: {
    fontSize: 14,
    color: '#E5E7EB',
    opacity: 0.8,
    textAlign: 'right',
  },
  aiStatusContainer: {
    marginBottom: 30,
  },
  aiStatusCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  aiStatusIndicator: {
    position: 'relative',
    marginRight: 12,
  },
  aiPulse: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  aiDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
    position: 'absolute',
    top: 4,
    left: 4,
  },
  aiStatusText: {
    flex: 1,
  },
  aiStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiStatusSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    opacity: 0.8,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  voiceSectionHeader: {
    marginBottom: 16,
  },
  voiceSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  voiceSectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  voiceInputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  voiceButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  voiceInputContainer: {
    marginTop: 0,
  },
  voiceCommandContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  voiceCommandHeader: {
    marginBottom: 8,
  },
  voiceCommandLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  voiceCommandText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  scheduleContainer: {
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventIconText: {
    fontSize: 20,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  eventStatus: {
    width: 20,
    alignItems: 'center',
  },
  eventStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionGradient: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default HomeScreen; 