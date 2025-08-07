import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CalendarEvent } from '../../store/slices/calendarSlice';
import { formatDuration, formatTime, formatTimeRange, getDurationInMinutes, getEventColor } from '../../utils/dateTime';

interface EventCardProps {
  event: CalendarEvent;
  onPress?: ((event: CalendarEvent) => void) | undefined;
  showTime?: boolean;
  showDuration?: boolean;
  compact?: boolean;
}

export const getEventIcon = (eventType?: string): React.ReactNode => {
  const icons = {
    meeting: <Ionicons name="people" size={24} color="white" />,
    appointment: <Ionicons name="calendar" size={24} color="white" />,
    reminder: <Ionicons name="alarm" size={24} color="white" />,
    deadline: <Ionicons name="time" size={24} color="white" />,
    personal: <Ionicons name="person" size={24} color="white" />,
    work: <Ionicons name="briefcase" size={24} color="white" />,
    default: <Ionicons name="calendar" size={24} color="white" />,
  };

  return icons[eventType as keyof typeof icons] || icons.default;
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  showTime = true,
  showDuration = true,
  compact = false,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(event);
    }
  };

  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const duration = getDurationInMinutes(startDate, endDate);
  const eventColor = event.color || getEventColor();
  const eventIcon = getEventIcon();

  const renderTimeInfo = () => {
    if (!showTime) return null;

    if (event.isAllDay) {
      return (
        <Text style={styles.timeText}>All Day</Text>
      );
    }

    return (
      <Text style={styles.timeText}>
        {formatTimeRange(startDate, endDate)}
        {showDuration && duration > 0 && (
          <Text style={styles.durationText}> • {formatDuration(duration)}</Text>
        )}
      </Text>
    );
  };

  const renderLocation = () => {
    if (!event.location) return null;

    return (
      <View style={styles.locationContainer}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText} numberOfLines={1}>
          {event.location}
        </Text>
      </View>
    );
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.container, styles.compactContainer, { borderLeftColor: eventColor }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {event.title}
          </Text>
          {showTime && !event.isAllDay && (
            <Text style={styles.compactTime}>
              {formatTime(startDate)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: eventColor }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.icon}>{eventIcon}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
          </View>
        </View>

        {renderTimeInfo()}

        {event.description && (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        )}

        {renderLocation()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  compactContainer: {
    padding: 8,
    marginVertical: 2,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  compactTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  timeText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  description: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
}); 