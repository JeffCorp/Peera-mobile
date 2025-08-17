import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { usePlannedExpenses } from '../../hooks/usePlannedExpenses';

export const PlannedExpenseStats: React.FC = () => {
  const { plannedExpenseStats, isLoading, getPlannedExpenseStats } = usePlannedExpenses();

  useEffect(() => {
    getPlannedExpenseStats();
  }, [getPlannedExpenseStats]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  if (!plannedExpenseStats) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No statistics available</Text>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Planned Expense Statistics</Text>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Planned</Text>
          <Text style={styles.summaryAmount}>
            {formatCurrency(plannedExpenseStats.totalPlannedAmount)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Active Planned</Text>
          <Text style={styles.summaryAmount}>
            {formatCurrency(plannedExpenseStats.activePlannedAmount)}
          </Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Category</Text>
        {Object.entries(plannedExpenseStats.categoryTotals).map(([category, amount]) => (
          <View key={category} style={styles.categoryRow}>
            <Text style={styles.categoryName}>{category}</Text>
            <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
          </View>
        ))}
      </View>

      {/* Frequency Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Frequency</Text>
        {Object.entries(plannedExpenseStats.frequencyBreakdown).map(([frequency, count]) => (
          <View key={frequency} style={styles.frequencyRow}>
            <Text style={styles.frequencyName}>
              {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
            </Text>
            <Text style={styles.frequencyCount}>{count} expenses</Text>
          </View>
        ))}
      </View>

      {/* Upcoming Expenses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Expenses</Text>
        {plannedExpenseStats.upcomingPlannedExpenses.length > 0 ? (
          plannedExpenseStats.upcomingPlannedExpenses.slice(0, 5).map((expense) => (
            <View key={expense.id} style={styles.upcomingRow}>
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingDescription}>{expense.description}</Text>
                <Text style={styles.upcomingCategory}>{expense.category}</Text>
              </View>
              <View style={styles.upcomingDetails}>
                <Text style={styles.upcomingAmount}>
                  {formatCurrency(expense.amount)}
                </Text>
                <Text style={styles.upcomingDate}>
                  {new Date(expense.plannedDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noUpcomingText}>No upcoming planned expenses</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  frequencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  frequencyName: {
    fontSize: 16,
    color: '#333',
  },
  frequencyCount: {
    fontSize: 16,
    color: '#666',
  },
  upcomingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  upcomingCategory: {
    fontSize: 14,
    color: '#666',
  },
  upcomingDetails: {
    alignItems: 'flex-end',
  },
  upcomingAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  upcomingDate: {
    fontSize: 12,
    color: '#888',
  },
  noUpcomingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
