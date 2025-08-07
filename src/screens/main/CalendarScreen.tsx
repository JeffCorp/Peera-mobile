import { CalendarEventList } from '@/components/calendar/CalendarEventList';
import useNotifications from '@/hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddEventForm } from '../../components/calendar/AddEventForm';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  CalendarEvent,
  createEvent,
  CreateEventData,
  deleteEvent,
  fetchEvents,
  setSelectedDate
} from '../../store/slices/calendarSlice';
import { endOfMonth, formatDate, startOfMonth } from '../../utils/dateTime';

export const CalendarScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { events = [], isLoading = false, error = null } = useAppSelector(state => state.calendar);
  const { user } = useAppSelector(state => state.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [selectedDate, setLocalSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const { sendLocalNotification } = useNotifications();

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

  // Function to load events for current month
  const loadCurrentMonthEvents = useCallback(async () => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    try {
      console.log("Loading current month events...");
      await dispatch(fetchEvents({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      })).unwrap();
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  }, [dispatch]);

  // Refetch events whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("CalendarScreen focused - refetching events");
      loadCurrentMonthEvents();
    }, [loadCurrentMonthEvents])
  );

  // Update marked dates when events change
  useEffect(() => {
    const marked: { [key: string]: any } = {};

    if (events && Array.isArray(events)) {
      events.forEach(event => {
        if (event) {
          const startTime = new Date(event?.startTime);

          const dateKey = startTime ? startTime?.toISOString().split('T')[0] : "";

          if (!marked[dateKey]) {
            marked[dateKey] = {
              marked: true,
              dotColor: event.color || '#6366F1',
            };
          }
        }
      });
    }

    // Mark today
    const today = new Date().toISOString().split('T')[0];
    if (marked[today]) {
      marked[today].selected = true;
      marked[today].selectedColor = '#6366F1';
    } else {
      marked[today] = {
        selected: true,
        selectedColor: '#6366F1',
      };
    }

    setMarkedDates(marked);
  }, [events]);

  // Update selected date events when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      const filteredEvents = events && Array.isArray(events) ? events.filter(event => {
        if (event) {
          const eventDate = new Date(event.startTime);
          return (
            eventDate.getFullYear() === selectedDateObj.getFullYear() &&
            eventDate.getMonth() === selectedDateObj.getMonth() &&
            eventDate.getDate() === selectedDateObj.getDate()
          );
        }
      }) : [];
      setSelectedDateEvents(filteredEvents);
    }
  }, [selectedDate, events]);

  const handleDayPress = (day: DateData) => {
    setLocalSelectedDate(day.dateString);
    dispatch(setSelectedDate(day.dateString));
    // fetch events for the selected date
    const start = startOfMonth(new Date(day.dateString));
    const end = endOfMonth(new Date(day.dateString));

    dispatch(fetchEvents({
      startTime: start.toISOString().split('T')[0],
      endTime: end.toISOString().split('T')[0],
    }));
  };

  const handleMonthChange = (month: DateData) => {
    const start = startOfMonth(new Date(month.timestamp));
    const end = endOfMonth(new Date(month.timestamp));

    dispatch(fetchEvents({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    }));
  };

  const handleAddEvent = async (eventData: CreateEventData) => {
    try {
      eventData.userId = user?.id || '';

      console.log("event data 123 => ", eventData);

      await dispatch(createEvent(eventData)).unwrap();
      setShowAddModal(false);
      Alert.alert('Success', 'Event created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await dispatch(deleteEvent(eventId)).unwrap();
      Alert.alert('Success', 'Event deleted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete event');
    }
  };

  const handleEventPress = (event: CalendarEvent) => {
    Alert.alert(
      event.title,
      `Time: ${formatDate(new Date(event.startTime), 'datetime')}\n${event.description || ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteEvent(event.id),
        },
      ]
    );
  };

  const handleRefresh = () => {
    // fetch events for the selected date
    const start = startOfMonth(new Date(selectedDate));
    const end = endOfMonth(new Date(selectedDate));

    dispatch(fetchEvents({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    }));
  };

  const calendarTheme = {
    backgroundColor: '#1F1F1F',
    calendarBackground: '#1F1F1F',
    textSectionTitleColor: '#FFFFFF',
    selectedDayBackgroundColor: '#6366F1',
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: '#6366F1',
    dayTextColor: '#FFFFFF',
    textDisabledColor: '#6B7280',
    dotColor: '#6366F1',
    selectedDotColor: '#FFFFFF',
    arrowColor: '#6366F1',
    monthTextColor: '#FFFFFF',
    indicatorColor: '#6366F1',
    textDayFontWeight: '500' as const,
    textMonthFontWeight: 'bold' as const,
    textDayHeaderFontWeight: '600' as const,
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
  };

  // Only show loading screen on initial load when no events exist
  if (isLoading && (!events || events.length === 0)) {
    console.log("Showing loading screen - isLoading:", isLoading, "events length:", events?.length);
    return <LoadingScreen message="Loading calendar..." />;
  }

  console.log("CalendarScreen - Rendering main content");

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

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Ionicons name="calendar" size={28} color="#FFFFFF" style={styles.titleIcon} />
                <Text style={styles.title}>Calendar</Text>
              </View>
              <Text style={styles.subtitle}>Intelligent event management</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.testButton}
                onPress={() => {
                  // Activate push notification here
                  sendLocalNotification(
                    'Test Notification',
                    'Push notifications are working! 🔔',
                    { test: true }
                  );
                }}
              >
                <Ionicons name="notifications" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.calendarContainer}>
              <View style={styles.calendarWrapper}>
                <Calendar
                  onDayPress={handleDayPress}
                  onMonthChange={handleMonthChange}
                  markedDates={markedDates}
                  markingType={'dot'}
                  theme={calendarTheme}
                />
              </View>
            </View>

            <View style={styles.eventsContainer}>
              <View style={styles.eventsHeader}>
                <View style={styles.eventsTitleContainer}>
                  <Text style={styles.eventsTitle}>
                    {selectedDate ? formatDate(new Date(selectedDate), 'long') : 'Today'}
                  </Text>
                  <Text style={styles.eventsSubtitle}>Your scheduled events</Text>
                </View>
                <View style={styles.eventsCountContainer}>
                  <Text style={styles.eventsCount}>
                    {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.eventsListContainer}>
                <CalendarEventList
                  events={selectedDateEvents || []}
                  onEventPress={handleEventPress}
                  onRefresh={handleRefresh}
                  refreshing={isLoading}
                  emptyMessage="No events scheduled for this day"
                  showDateHeaders={false}
                  useScrollView={true}
                />
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AddEventForm
          onSubmit={handleAddEvent}
          onCancel={() => setShowAddModal(false)}
          loading={isLoading}
          initialDate={selectedDate ? new Date(selectedDate) : new Date()}
        />
      </Modal>
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
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 70, // Add space for the bottom tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  testButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  testNotificationButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testNotificationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendarWrapper: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 300,
  },
  eventsContainer: {
    marginTop: 20,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitleContainer: {
    flex: 1,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventsSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  eventsCountContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  eventsCount: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  eventsListContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    paddingTop: 10,
    paddingBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10, // Add space for the bottom tab bar
  },
});