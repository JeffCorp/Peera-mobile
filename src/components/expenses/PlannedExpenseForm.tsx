import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { usePlannedExpenses } from '../../hooks/usePlannedExpenses';
import {
  CreatePlannedExpenseDto,
  PlannedExpense,
  UpdatePlannedExpenseDto,
} from '../../services/expenseService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface PlannedExpenseFormProps {
  expense?: PlannedExpense;
  onSave?: () => void;
  onCancel?: () => void;
  mode: 'create' | 'edit';
}

const FREQUENCY_OPTIONS = [
  { label: 'Once', value: 'once' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

export const PlannedExpenseForm: React.FC<PlannedExpenseFormProps> = ({
  expense,
  onSave,
  onCancel,
  mode,
}) => {
  const { addPlannedExpense, editPlannedExpense, isLoading, error } = usePlannedExpenses();

  const [formData, setFormData] = useState<CreatePlannedExpenseDto>({
    amount: 0,
    category: '',
    description: '',
    plannedDate: new Date().toISOString().split('T')[0],
    frequency: 'once',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (expense && mode === 'edit') {
      setFormData({
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        plannedDate: expense.plannedDate.split('T')[0],
        frequency: expense.frequency,
        startDate: expense.startDate.split('T')[0],
        endDate: expense.endDate?.split('T')[0] || '',
      });
    }
  }, [expense, mode]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.plannedDate) {
      newErrors.plannedDate = 'Planned date is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.frequency !== 'once' && !formData.endDate) {
      newErrors.endDate = 'End date is required for recurring expenses';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        await addPlannedExpense(formData);
        Alert.alert('Success', 'Planned expense created successfully');
      } else if (expense) {
        const updateData: UpdatePlannedExpenseDto = { ...formData };
        await editPlannedExpense(expense.id, updateData);
        Alert.alert('Success', 'Planned expense updated successfully');
      }
      onSave?.();
    } catch (error) {
      console.error('Failed to save planned expense:', error);
    }
  };

  const updateFormField = (field: keyof CreatePlannedExpenseDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {mode === 'create' ? 'Create Planned Expense' : 'Edit Planned Expense'}
        </Text>

        <View style={styles.form}>
          <Input
            label="Amount"
            value={formData.amount.toString()}
            onChangeText={(text) => updateFormField('amount', parseFloat(text) || 0)}
            keyboardType="decimal-pad"
            prefix="$"
            error={errors.amount}
            style={styles.input}
          />

          <Input
            label="Category"
            value={formData.category}
            onChangeText={(text) => updateFormField('category', text)}
            placeholder="e.g., Food, Transportation"
            error={errors.category}
            style={styles.input}
          />

          <Input
            label="Description"
            value={formData.description}
            onChangeText={(text) => updateFormField('description', text)}
            placeholder="Describe the expense"
            multiline
            numberOfLines={3}
            error={errors.description}
            style={styles.input}
          />

          <Input
            label="Planned Date"
            value={formData.plannedDate}
            onChangeText={(text) => updateFormField('plannedDate', text)}
            placeholder="YYYY-MM-DD"
            error={errors.plannedDate}
            style={styles.input}
          />

          <View style={styles.frequencyContainer}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyOptions}>
              {FREQUENCY_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  title={option.label}
                  onPress={() => updateFormField('frequency', option.value)}
                  variant={formData.frequency === option.value ? 'primary' : 'secondary'}
                  size="small"
                  style={styles.frequencyButton}
                />
              ))}
            </View>
          </View>

          <Input
            label="Start Date"
            value={formData.startDate}
            onChangeText={(text) => updateFormField('startDate', text)}
            placeholder="YYYY-MM-DD"
            error={errors.startDate}
            style={styles.input}
          />

          {formData.frequency !== 'once' && (
            <Input
              label="End Date"
              value={formData.endDate}
              onChangeText={(text) => updateFormField('endDate', text)}
              placeholder="YYYY-MM-DD (optional)"
              error={errors.endDate}
              style={styles.input}
            />
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title={mode === 'create' ? 'Create' : 'Update'}
            onPress={handleSave}
            loading={isLoading}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  frequencyContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  frequencyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    minWidth: 60,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
