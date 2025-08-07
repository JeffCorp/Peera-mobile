import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { eventsApi } from '../../services/api/eventsApi';
import { voiceCommandProcessor } from '../../services/voiceCommandProcessor';
import { CreateEventData } from '../../store/slices/calendarSlice';
import { addHours, formatDate, formatTime } from '../../utils/dateTime';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { VoiceInput } from '../voice/VoiceInput';

interface AddEventFormProps {
  onSubmit: (eventData: CreateEventData) => void;
  onCancel: () => void;
  loading?: boolean;
  initialDate?: Date;
}

export const AddEventForm: React.FC<AddEventFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  initialDate = new Date(),
}) => {
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    startTime: initialDate.toISOString(),
    endTime: addHours(initialDate, 1).toISOString(),
    location: '',
    isAllDay: false,
    color: '#007AFF',
    userId: '',
  });

  const [errors, setErrors] = useState<{
    title?: string;
    startTime?: string;
    endTime?: string;
  }>({});

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { title?: string; startTime?: string; endTime?: string } = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    // Date validation
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);

    if (!formData.isAllDay) {
      if (startTime >= endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateEventData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleVoiceTranscription = (text: string) => {
    // Use the voice command processor to extract structured data
    const commandData = voiceCommandProcessor.processVoiceInput(text);

    console.log('Voice command processed:', commandData);

    // Update form fields based on extracted data
    if (commandData.title) {
      handleInputChange('title', commandData.title);
    }

    if (commandData.description) {
      handleInputChange('description', commandData.description);
    }

    if (commandData.location) {
      handleInputChange('location', commandData.location);
    }

    if (commandData.time) {
      // Parse time and update start time
      const timeMatch = commandData.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const isPM = timeMatch[3].toUpperCase() === 'PM';

        const newTime = new Date(formData.startTime);
        newTime.setHours(isPM && hours !== 12 ? hours + 12 : hours === 12 && !isPM ? 0 : hours, minutes);

        handleInputChange('startTime', newTime.toISOString());

        // Set end time to 1 hour later
        const endTime = new Date(newTime);
        endTime.setHours(endTime.getHours() + 1);
        handleInputChange('endTime', endTime.toISOString());
      }
    }

    if (commandData.date) {
      const newDate = new Date(formData.startTime);

      if (commandData.date === 'tomorrow') {
        newDate.setDate(newDate.getDate() + 1);
      } else if (commandData.date === 'today') {
        // Keep current date
      } else {
        // Try to parse specific date
        const dateMatch = commandData.date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (dateMatch) {
          const month = parseInt(dateMatch[1]) - 1; // Month is 0-indexed
          const day = parseInt(dateMatch[2]);
          const year = parseInt(dateMatch[3]);
          newDate.setFullYear(year, month, day);
        }
      }

      handleInputChange('startTime', newDate.toISOString());
      handleInputChange('endTime', new Date(newDate.getTime() + 60 * 60 * 1000).toISOString());
    }

    if (commandData.isAllDay) {
      handleInputChange('isAllDay', true);
    }

    // Show feedback to user
    const response = voiceCommandProcessor.generateResponse(commandData);
    Alert.alert('Voice Input Processed', response);
  };

  const handleVoiceError = (error: string) => {
    Alert.alert('Voice Input Error', error);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowStartPicker(false);
      setShowEndPicker(false);
    }

    if (selectedDate) {
      if (showDatePicker) {
        const currentStart = new Date(formData.startTime);
        const currentEnd = new Date(formData.endTime);

        // Update both start and end dates to the selected date
        const newstartTime = new Date(selectedDate);
        newstartTime.setHours(currentStart.getHours(), currentStart.getMinutes());

        const newendTime = new Date(selectedDate);
        newendTime.setHours(currentEnd.getHours(), currentEnd.getMinutes());

        setFormData(prev => ({
          ...prev,
          startTime: newstartTime.toISOString(),
          endTime: newendTime.toISOString(),
        }));
      } else if (showStartPicker) {
        const currentStart = new Date(formData.startTime);
        const newstartTime = new Date(selectedDate);
        newstartTime.setFullYear(currentStart.getFullYear(), currentStart.getMonth(), currentStart.getDate());

        setFormData(prev => ({
          ...prev,
          startTime: newstartTime.toISOString(),
        }));
      } else if (showEndPicker) {
        const currentEnd = new Date(formData.endTime);
        const newendTime = new Date(selectedDate);
        newendTime.setFullYear(currentEnd.getFullYear(), currentEnd.getMonth(), currentEnd.getDate());

        setFormData(prev => ({
          ...prev,
          endTime: newendTime.toISOString(),
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Check for conflicts
    try {
      const conflictResult = await eventsApi.checkConflicts({
        startTime: formData.startTime,
        endTime: formData.endTime,
      });

      if (conflictResult.success && conflictResult.data && conflictResult.data.length > 0) {
        Alert.alert(
          'Scheduling Conflict',
          'This time conflicts with existing events. Do you want to continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => onSubmit(formData) },
          ]
        );
        return;
      }
    } catch (error) {
      console.warn('Failed to check conflicts:', error);
    }

    console.log('formData', formData);
    onSubmit(formData);
  };

  const renderDateTimePicker = () => {
    console.log('Picker states:', { showDatePicker, showStartPicker, showEndPicker });

    if (!showDatePicker && !showStartPicker && !showEndPicker) {
      return null;
    }

    let currentDate: Date;
    let currentMode: 'date' | 'time';

    if (showDatePicker) {
      currentDate = new Date(formData.startTime);
      currentMode = 'date';
    } else if (showStartPicker) {
      currentDate = new Date(formData.startTime);
      currentMode = 'time';
    } else if (showEndPicker) {
      currentDate = new Date(formData.endTime);
      currentMode = 'time';
    } else {
      return null;
    }

    console.log('Rendering picker:', { currentMode, currentDate });

    if (Platform.OS === 'ios') {
      return (
        <Modal
          visible={showDatePicker || showStartPicker || showEndPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.pickerLabel}>
                {showDatePicker ? 'Select Date' : showStartPicker ? 'Select Start Time' : 'Select End Time'}
              </Text>
              <DateTimePicker
                value={currentDate}
                mode={currentMode}
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                textColor="#FFFFFF"
                style={styles.picker}
              />
              <Button
                title="Done"
                onPress={() => {
                  setShowDatePicker(false);
                  setShowStartPicker(false);
                  setShowEndPicker(false);
                }}
                style={styles.doneButton}
              />
            </View>
          </View>
        </Modal>
      );
    }

    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>
          {showDatePicker ? 'Select Date' : showStartPicker ? 'Select Start Time' : 'Select End Time'}
        </Text>
        <DateTimePicker
          value={currentDate}
          mode={currentMode}
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
          textColor="#FFFFFF"
          style={styles.picker}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add New Event</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Event Title"
            placeholder="Enter event title"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            error={errors.title}
            autoFocus
          />

          <View style={styles.voiceInputContainer}>
            <Text style={styles.voiceInputLabel}>Voice Input</Text>
            <VoiceInput
              onTranscription={handleVoiceTranscription}
              onError={handleVoiceError}
              placeholder="Tap to speak event details"
              style={styles.voiceInput}
            />
            <Text style={styles.voiceInputHint}>
              Try: &quot;Title team meeting, description weekly standup, location conference room, time 2 PM tomorrow&quot;
            </Text>
          </View>

          <Input
            label="Description"
            placeholder="Enter event description (optional)"
            value={formData.description || ''}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={3}
          />

          <Input
            label="Location"
            placeholder="Enter location (optional)"
            value={formData.location || ''}
            onChangeText={(value) => handleInputChange('location', value)}
          />

          <View style={styles.dateTimeSection}>
            <Text style={styles.sectionTitle}>Date & Time</Text>

            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeItem}>
                <Text style={styles.dateTimeLabel}>Date</Text>
                <Button
                  title={formatDate(new Date(formData.startTime), 'short')}
                  onPress={() => {
                    setShowDatePicker(true);
                    setShowStartPicker(false);
                    setShowEndPicker(false);
                  }}
                  variant={showDatePicker ? "primary" : "outline"}
                  size="small"
                />
              </View>
            </View>

            {!formData.isAllDay && (
              <View style={styles.timeRow}>
                <View style={styles.dateTimeItem}>
                  <Text style={styles.dateTimeLabel}>Start Time</Text>
                  <Button
                    title={formatTime(new Date(formData.startTime))}
                    onPress={() => {
                      setShowStartPicker(true);
                      setShowEndPicker(false);
                      setShowDatePicker(false);
                    }}
                    variant={showStartPicker ? "primary" : "outline"}
                    size="small"
                  />
                </View>

                <View style={styles.dateTimeItem}>
                  <Text style={styles.dateTimeLabel}>End Time</Text>
                  <Button
                    title={formatTime(new Date(formData.endTime))}
                    onPress={() => {
                      setShowEndPicker(true);
                      setShowStartPicker(false);
                      setShowDatePicker(false);
                    }}
                    variant={showEndPicker ? "primary" : "outline"}
                    size="small"
                  />
                </View>
              </View>
            )}

            <View style={styles.allDayRow}>
              <Button
                title={formData.isAllDay ? 'All Day Event' : 'Set as All Day'}
                onPress={() => handleInputChange('isAllDay', !formData.isAllDay)}
                variant={formData.isAllDay ? 'primary' : 'outline'}
                size="small"
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Create Event"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>

      {renderDateTimePicker()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  form: {
    flex: 1,
  },
  voiceInputContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  voiceInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  voiceInput: {
    fontSize: 16,
    color: '#FFFFFF',
    padding: 0,
    marginBottom: 8,
  },
  voiceInputHint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  dateTimeSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  dateTimeRow: {
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeItem: {
    flex: 1,
    marginRight: 12,
  },
  dateTimeLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  allDayRow: {
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  cancelButton: {
    flex: 1,
    marginRight: 12,
  },
  submitButton: {
    flex: 1,
    marginLeft: 12,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  picker: {
    width: '100%',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  doneButton: {
    marginTop: 20,
    width: '100%',
  },
}); 