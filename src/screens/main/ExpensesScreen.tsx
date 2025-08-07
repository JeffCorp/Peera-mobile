import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Expense, ExpenseCategory, ExpenseFilters, expenseService, ExpenseStats } from '../../services/expenseService';

const ExpensesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [groupedExpenses, setGroupedExpenses] = useState<{ [category: string]: Expense[] }>({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, filters, searchTerm, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, categoriesData, statsData] = await Promise.all([
        expenseService.getExpenses(user?.id || '1'),
        expenseService.getCategories(),
        expenseService.getExpenseStats(user?.id || '1'),
      ]);

      setExpenses(expensesData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        expense =>
          expense.description.toLowerCase().includes(term) ||
          expense.category.toLowerCase().includes(term) ||
          expenseService.formatCurrency(expense.amount).includes(term)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Apply date range filters
    if (filters.startDate) {
      filtered = filtered.filter(
        expense => new Date(expense.date) >= new Date(filters.startDate!)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        expense => new Date(expense.date) <= new Date(filters.endDate!)
      );
    }

    // Apply amount range filters
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(expense => expense.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(expense => expense.amount <= filters.maxAmount!);
    }

    setFilteredExpenses(filtered);

    // Group expenses by category
    const grouped: { [category: string]: Expense[] } = {};
    filtered.forEach(expense => {
      if (!grouped[expense.category]) {
        grouped[expense.category] = [];
      }
      grouped[expense.category].push(expense);
    });
    setGroupedExpenses(grouped);
  };

  const handleDeleteExpense = (expense: Expense) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await expenseService.deleteExpense(expense.id);
              await loadData();
              Alert.alert('Success', 'Expense deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const handleEditExpense = (expense: Expense) => {
    // Navigate to edit expense screen
    // navigation.navigate('EditExpense' as never, { expenseId: expense.id } as never);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setFilters({});
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (categoryName: string): string => {
    const category = categories.find(c => c.name === categoryName);
    return category?.icon || '💰';
  };

  const getCategoryColor = (categoryName: string): string => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6366F1';
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseDescription}>{item.description}</Text>
          <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
        </View>
        <Text style={styles.expenseAmount}>
          {expenseService.formatCurrency(item.amount)}
        </Text>
      </View>

      <View style={styles.expenseFooter}>
        <View style={styles.expenseActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditExpense(item)}
          >
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteExpense(item)}
          >
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCategorySection = ({ item }: { item: { category: string; expenses: Expense[] } }) => {
    const categoryTotal = item.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <View style={styles.categoryIconContainer}>
              <Text style={styles.categorySectionIcon}>{getCategoryIcon(item.category)}</Text>
            </View>
            <View style={styles.categoryTextContainer}>
              <Text style={styles.categorySectionName}>{item.category}</Text>
              <Text style={styles.categoryExpenseCount}>{item.expenses.length} expenses</Text>
            </View>
          </View>
          <Text style={styles.categoryTotal}>
            {expenseService.formatCurrency(categoryTotal)}
          </Text>
        </View>

        {item.expenses.map((expense) => (
          <View key={expense.id} style={styles.expenseCard}>
            <View style={styles.expenseHeader}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseDescription}>{expense.description}</Text>
                <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                {expenseService.formatCurrency(expense.amount)}
              </Text>
            </View>

            <View style={styles.expenseFooter}>
              <View style={styles.expenseActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditExpense(expense)}
                >
                  <Text style={styles.actionButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteExpense(expense)}
                >
                  <Text style={styles.actionButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>💰 Financial Overview</Text>
          <Text style={styles.statsSubtitle}>AI-powered insights</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>💸</Text>
            </View>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>{expenseService.formatCurrency(stats.totalAmount)}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📊</Text>
            </View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{stats.expenseCount}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📈</Text>
            </View>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{expenseService.formatCurrency(stats.averageAmount)}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🏷️</Text>
            </View>
            <Text style={styles.statLabel}>Categories</Text>
            <Text style={styles.statValue}>{Object.keys(stats.categoryTotals).length}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

  const data = Object.entries(groupedExpenses).map(([category, expenses]) => ({
    category,
    expenses,
  }));

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

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>💰 Expenses</Text>
            <Text style={styles.subtitle}>AI-powered expense tracking</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddExpense' as never)}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search expenses..."
              placeholderTextColor="#9CA3AF"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
        >
          <TouchableOpacity
            style={[styles.categoryFilterItem, !selectedCategory && styles.categoryFilterItemActive]}
            onPress={() => setSelectedCategory('')}
          >
            <Text style={styles.categoryFilterText}>All</Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryFilterItem,
                selectedCategory === category.name && styles.categoryFilterItemActive,
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text style={styles.categoryFilterIcon}>{category.icon}</Text>
              <Text style={styles.categoryFilterText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats */}
        {renderStats()}

        {/* Expenses List */}
        <FlatList
          data={data}
          renderItem={renderCategorySection}
          keyExtractor={(item) => item.category}
          style={styles.expensesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💰</Text>
              <Text style={styles.emptyStateText}>No expenses found</Text>
              <Text style={styles.emptyStateSubtext}>Start tracking your spending</Text>
              <TouchableOpacity
                style={styles.addFirstExpenseButton}
                onPress={() => navigation.navigate('AddExpense' as never)}
              >
                <Text style={styles.addFirstExpenseText}>Add Your First Expense</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Filters Modal */}
        <Modal
          visible={showFilters}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filters</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Text style={styles.modalCloseButton}>Done</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Date Range</Text>
                  {/* Date range filters would go here */}
                  <Text style={styles.filterPlaceholder}>Date range filters coming soon...</Text>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Amount Range</Text>
                  {/* Amount range filters would go here */}
                  <Text style={styles.filterPlaceholder}>Amount range filters coming soon...</Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </Animated.View>
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
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 120, // Add space for the bottom tab bar
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryFilter: {
    marginBottom: 20,
  },
  categoryFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryFilterItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  categoryFilterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsHeader: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  expensesList: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categorySectionIcon: {
    fontSize: 18,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categorySectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  categoryExpenseCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  expenseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  expenseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  addFirstExpenseButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  addFirstExpenseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F1F1F',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  filterPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default ExpensesScreen; 