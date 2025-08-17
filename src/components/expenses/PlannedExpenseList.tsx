import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { usePlannedExpenses } from '../../hooks/usePlannedExpenses';
import { PlannedExpense } from '../../services/expenseService';
import { Button } from '../ui/Button';

interface PlannedExpenseListProps {
  onEditExpense?: (expense: PlannedExpense) => void;
  onViewExpense?: (expense: PlannedExpense) => void;
}

export const PlannedExpenseList: React.FC<PlannedExpenseListProps> = ({
  onEditExpense,
  onViewExpense,
}) => {
  const {
    plannedExpenses,
    isLoading,
    error,
    getPlannedExpenses,
    removePlannedExpense,
    clearPlannedExpenseError,
  } = usePlannedExpenses();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getPlannedExpenses();
  }, [getPlannedExpenses]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearPlannedExpenseError();
    }
  }, [error, clearPlannedExpenseError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await getPlannedExpenses();
    setRefreshing(false);
  };

  const handleDeleteExpense = (expense: PlannedExpense) => {
    Alert.alert(
      'Delete Planned Expense',
      `Are you sure you want to delete "${expense.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removePlannedExpense(expense.id),
        },
      ]
    );
  };

  const renderExpenseItem = ({ item }: { item: PlannedExpense }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
        <View style={styles.expenseStatus}>
          <Text style={[styles.statusBadge, { backgroundColor: item.isActive ? '#4CAF50' : '#9E9E9E' }]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <Text style={styles.expenseDescription}>{item.description}</Text>
      <Text style={styles.expenseCategory}>{item.category}</Text>

      <View style={styles.expenseDetails}>
        <Text style={styles.expenseDate}>
          Planned: {new Date(item.plannedDate).toLocaleDateString()}
        </Text>
        <Text style={styles.expenseFrequency}>
          {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
        </Text>
      </View>

      <View style={styles.expenseActions}>
        {onViewExpense && (
          <Button
            title="View"
            onPress={() => onViewExpense(item)}
            variant="secondary"
            size="small"
          />
        )}
        {onEditExpense && (
          <Button
            title="Edit"
            onPress={() => onEditExpense(item)}
            variant="secondary"
            size="small"
          />
        )}
        <Button
          title="Delete"
          onPress={() => handleDeleteExpense(item)}
          variant="danger"
          size="small"
        />
      </View>
    </View>
  );

  if (isLoading && plannedExpenses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading planned expenses...</Text>
      </View>
    );
  }

  if (plannedExpenses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No planned expenses found</Text>
        <Text style={styles.emptySubtext}>Create your first planned expense to get started</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={plannedExpenses}
      renderItem={renderExpenseItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  expenseItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  expenseStatus: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  expenseDate: {
    fontSize: 12,
    color: '#888',
  },
  expenseFrequency: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
