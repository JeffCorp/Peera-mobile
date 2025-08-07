import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CalendarEvent } from '../../store/slices/calendarSlice';
import { formatTimeRange } from '../../utils/dateTime';

interface ConflictWarningProps {
  conflicts: CalendarEvent[];
  onViewConflicts?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export const ConflictWarning: React.FC<ConflictWarningProps> = ({
  conflicts,
  onViewConflicts,
  onDismiss,
  compact = false,
}) => {
  if (conflicts.length === 0) {
    return null;
  }

  const renderConflictItem = (event: CalendarEvent) => {
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);

    return (
      <View key={event.id} style={styles.conflictItem}>
        <Text style={styles.conflictTitle} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.conflictTime}>
          {formatTimeRange(startDate, endDate)}
        </Text>
      </View>
    );
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onViewConflicts}
        activeOpacity={0.7}
      >
        <Text style={styles.compactIcon}>⚠️</Text>
        <Text style={styles.compactText}>
          {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} detected
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Scheduling Conflicts</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.message}>
        The selected time conflicts with {conflicts.length} existing event{conflicts.length > 1 ? 's' : ''}:
      </Text>

      <View style={styles.conflictsList}>
        {conflicts.slice(0, 3).map(renderConflictItem)}
        {conflicts.length > 3 && (
          <Text style={styles.moreText}>
            ...and {conflicts.length - 3} more
          </Text>
        )}
      </View>

      {onViewConflicts && (
        <TouchableOpacity
          style={styles.viewButton}
          onPress={onViewConflicts}
          activeOpacity={0.7}
        >
          <Text style={styles.viewButtonText}>View All Conflicts</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  compactContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  compactIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
  },
  compactText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
    color: '#856404',
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
    lineHeight: 20,
  },
  conflictsList: {
    marginBottom: 12,
  },
  conflictItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  conflictTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  conflictTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  moreText: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  viewButton: {
    backgroundColor: '#FFC107',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
}); 