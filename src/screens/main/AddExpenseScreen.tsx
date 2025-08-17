import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { cameraService } from '../../services/cameraService';
import { ExpenseCategory, ExpenseFormData, expenseService, FormErrors } from '../../services/expenseService';

const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    receiptUri: '',
    calendarEventId: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await expenseService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setSelectedDate(selectedDate);
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: dateString }));
      if (formErrors.date) {
        setFormErrors(prev => ({ ...prev, date: '' }));
      }
    }
  };

  const handleDatePickerDismiss = () => {
    setShowDatePicker(false);
  };

  const handleCategorySelect = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, category: category.name }));
    setShowCategoryModal(false);
    if (formErrors.category) {
      setFormErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleReceiptCapture = async () => {
    try {
      const result = await cameraService.showCameraOptions();
      if (result) {
        // Validate the image
        const validation = await cameraService.validateImageRequirements(result.uri);
        if (!validation.valid) {
          Alert.alert('Invalid Image', validation.errors.join('\n'));
          return;
        }

        // Compress the image if needed
        const compressedUri = await cameraService.compressImage(result.uri, {
          quality: cameraService.getRecommendedQuality(),
          maxWidth: 1920,
          maxHeight: 1080,
        });

        setFormData(prev => ({ ...prev, receiptUri: compressedUri }));
      }
    } catch (error) {
      console.error('Failed to capture receipt:', error);
      Alert.alert('Error', 'Failed to capture receipt. Please try again.');
    }
  };

  const handleRemoveReceipt = () => {
    setFormData(prev => ({ ...prev, receiptUri: '' }));
  };

  const validateForm = (): boolean => {
    const errors = expenseService.validateExpenseForm(formData);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await expenseService.createExpense(user?.id || '1', formData);
      Alert.alert('Success', 'Expense added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Expense</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <Input
            label="Amount"
            value={formData.amount}
            onChangeText={(value) => handleInputChange('amount', value)}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={formErrors.amount}
            prefix="$"
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <TouchableOpacity
            style={[styles.categoryButton, formErrors.category && styles.categoryButtonError]}
            onPress={() => setShowCategoryModal(true)}
          >
            {selectedCategory ? (
              <View style={styles.selectedCategory}>
                <Text style={styles.categoryIcon}>{selectedCategory.icon}</Text>
                <Text style={styles.categoryName}>{selectedCategory.name}</Text>
              </View>
            ) : (
              <Text style={styles.categoryPlaceholder}>Select a category</Text>
            )}
            <Text style={styles.categoryArrow}>▼</Text>
          </TouchableOpacity>
          {formErrors.category && (
            <Text style={styles.errorText}>{formErrors.category}</Text>
          )}
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Input
            label="Description"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="What was this expense for?"
            multiline
            numberOfLines={3}
            error={formErrors.description}
          />
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(formData.date)}</Text>
            <Text style={styles.dateButtonIcon}>📅</Text>
          </TouchableOpacity>
          {formErrors.date && (
            <Text style={styles.errorText}>{formErrors.date}</Text>
          )}
        </View>

        {/* Receipt Capture */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt (Optional)</Text>
          {formData.receiptUri ? (
            <View style={styles.receiptContainer}>
              <Image source={{ uri: formData.receiptUri }} style={styles.receiptImage} />
              <TouchableOpacity
                style={styles.removeReceiptButton}
                onPress={handleRemoveReceipt}
              >
                <Text style={styles.removeReceiptText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.receiptButton} onPress={handleReceiptCapture}>
              <Text style={styles.receiptButtonIcon}>📷</Text>
              <Text style={styles.receiptButtonText}>Capture Receipt</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Calendar Event Link (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Link to Calendar Event (Optional)</Text>
          <TouchableOpacity style={styles.calendarButton}>
            <Text style={styles.calendarButtonText}>Select Calendar Event</Text>
            <Text style={styles.calendarButtonIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title={loading ? 'Adding Expense...' : 'Add Expense'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={handleDatePickerDismiss}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={handleDatePickerDismiss}>
                  <Text style={styles.modalCloseButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalCloseButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryItem}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={styles.categoryItemIcon}>{category.icon}</Text>
                  <Text style={styles.categoryItemName}>{category.name}</Text>
                  <View style={[styles.categoryItemColor, { backgroundColor: category.color }]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#6c757d',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryButtonError: {
    borderColor: '#dc3545',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  categoryPlaceholder: {
    fontSize: 16,
    color: '#6c757d',
  },
  categoryArrow: {
    fontSize: 12,
    color: '#6c757d',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  dateButtonIcon: {
    fontSize: 20,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  receiptButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  receiptButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  receiptContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  removeReceiptButton: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
  removeReceiptText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendarButtonText: {
    fontSize: 16,
    color: '#6c757d',
  },
  calendarButtonIcon: {
    fontSize: 20,
  },
  submitSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: '#28a745',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  categoryList: {
    padding: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  categoryItemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  categoryItemName: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  categoryItemColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default AddExpenseScreen; 