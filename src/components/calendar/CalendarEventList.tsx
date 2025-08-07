import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CalendarEvent } from '../../store/slices/calendarSlice';
import { formatDate, isToday, isTomorrow, isYesterday } from '../../utils/dateTime';
import { EventCard } from './EventCard';

interface CalendarEventListProps {
  events: CalendarEvent[];
  onEventPress?: (event: CalendarEvent) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyMessage?: string;
  showDateHeaders?: boolean;
  compact?: boolean;
  useScrollView?: boolean;
}

interface GroupedEvents {
  date: string;
  dateLabel: string;
  events: CalendarEvent[];
}

export const CalendarEventList: React.FC<CalendarEventListProps> = ({
  events,
  onEventPress,
  onRefresh,
  refreshing = false,
  emptyMessage = 'No events scheduled',
  showDateHeaders = true,
  compact = false,
  useScrollView = false,
}) => {
  const groupEventsByDate = (events: CalendarEvent[]): GroupedEvents[] => {
    const grouped: { [key: string]: CalendarEvent[] } = {};

    events.forEach(event => {
      const startDate = new Date(event.startTime);
      const dateKey = startDate.toDateString();

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    // Sort events within each group by start time
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });

    // Convert to array and sort by date
    return Object.keys(grouped)
      .map(dateKey => {
        const date = new Date(dateKey);
        let dateLabel = formatDate(date, 'long');

        if (isToday(date)) {
          dateLabel = 'Today';
        } else if (isYesterday(date)) {
          dateLabel = 'Yesterday';
        } else if (isTomorrow(date)) {
          dateLabel = 'Tomorrow';
        }

        return {
          date: dateKey,
          dateLabel,
          events: grouped[dateKey],
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const groupedEvents = groupEventsByDate(events);

  const renderDateHeader = (dateLabel: string) => {
    if (!showDateHeaders) return null;

    return (
      <View style={styles.dateHeader}>
        <Text style={styles.dateHeaderText}>{dateLabel}</Text>
      </View>
    );
  };

  const renderEvent = ({ item }: { item: CalendarEvent }) => (
    <EventCard
      event={item}
      onPress={onEventPress || undefined}
      compact={compact}
    />
  );

  const renderGroup = ({ item }: { item: GroupedEvents }) => (
    <View style={styles.group}>
      {renderDateHeader(item.dateLabel)}
      {item.events.map((event, index) => (
        <EventCard
          key={event.id}
          event={event}
          onPress={onEventPress}
          compact={compact}
        />
      ))}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📅</Text>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  if (events.length === 0) {
    return renderEmpty();
  }

  // If useScrollView is true, render events in a regular View instead of FlatList
  if (useScrollView) {
    console.log('CalendarEventList - useScrollView mode, events:', events.length);

    if (!showDateHeaders) {
      return (
        <View style={styles.container}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={onEventPress}
              compact={compact}
            />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {groupedEvents.map((group) => (
          <View key={group.date} style={styles.group}>
            {renderDateHeader(group.dateLabel)}
            {group.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={onEventPress}
                compact={compact}
              />
            ))}
          </View>
        ))}
      </View>
    );
  }

  if (!showDateHeaders) {
    return (
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <FlatList
      data={groupedEvents}
      renderItem={renderGroup}
      keyExtractor={(item) => item.date}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#6366F1']}
          tintColor="#6366F1"
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 8,
  },
  group: {
    marginBottom: 16,
  },
  dateHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
}); 