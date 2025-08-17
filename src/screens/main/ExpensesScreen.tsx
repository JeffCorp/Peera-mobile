import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { usePlannedExpenses } from '../../hooks/usePlannedExpenses';
import { CreatePlannedExpenseDto, Expense, ExpenseCategory, ExpenseFilters, ExpenseFormData, expenseService, ExpenseStats, FormErrors, PlannedExpense } from '../../services/expenseService';

// Import planned expense types from service


export interface PlannedExpenseFormData {
  amount: string;
  category: string;
  description: string;
  plannedDate: string;
  priority: 'low' | 'medium' | 'high';
  isRecurring?: boolean;
  notes?: string;
}

const ExpensesScreen: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [filteredStats, setFilteredStats] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters] = useState<ExpenseFilters>({});
  const [groupedExpenses, setGroupedExpenses] = useState<{ [category: string]: Expense[] }>({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [tabSlideAnim] = useState(new Animated.Value(0));
  const [showAddModal, setShowAddModal] = useState(false);

  // Stats modal states
  const [showTotalSpentModal, setShowTotalSpentModal] = useState(false);
  const [showExpensesCountModal, setShowExpensesCountModal] = useState(false);
  const [showAverageModal, setShowAverageModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState(0);

  // Planned expenses state
  const [showPlannedExpenses, setShowPlannedExpenses] = useState(false);
  const [showAddPlannedModal, setShowAddPlannedModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedExpenseForConversion, setSelectedExpenseForConversion] = useState<PlannedExpense | null>(null);
  const [conversionDate, setConversionDate] = useState(new Date().toISOString().split('T')[0]);
  const [conversionNotes, setConversionNotes] = useState('');

  // Use the planned expenses hook
  const {
    plannedExpenses,
    isLoading: plannedExpensesLoading,
    error: plannedExpensesError,
    getPlannedExpenses,
    addPlannedExpense,
    editPlannedExpense,
    removePlannedExpense,
    convertPlannedExpenseToActual,
    clearPlannedExpenseError,
  } = usePlannedExpenses();

  // Add expense form state
  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Planned expense form state
  const [plannedExpenseForm, setPlannedExpenseForm] = useState<PlannedExpenseFormData>({
    amount: '',
    category: '',
    description: '',
    plannedDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    isRecurring: false,
    notes: '',
  });
  const [plannedFormErrors, setPlannedFormErrors] = useState<Partial<PlannedExpenseFormData>>({});

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
  }, [fadeAnim, slideAnim]);

  // Calculate stats from expense array
  const calculateStats = useCallback((expenseArray: Expense[]): ExpenseStats => {
    const totalAmount = expenseArray.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const expenseCount = expenseArray.length;
    const averageAmount = expenseCount > 0 ? totalAmount / expenseCount : 0;

    // Calculate category totals
    const categoryTotals: { [category: string]: number } = {};
    expenseArray.forEach((expense) => {
      categoryTotals[expense.category] = (Number(categoryTotals[expense.category]) || 0) + Number(expense.amount);
    });

    // Calculate monthly totals
    const monthlyTotals: { [month: string]: number } = {};
    expenseArray.forEach((expense) => {
      const expenseDate = typeof expense.date === 'string' ? new Date(expense.date) : expense.date;
      const monthKey = expenseDate.toISOString().substring(0, 7); // YYYY-MM format
      monthlyTotals[monthKey] = (Number(monthlyTotals[monthKey]) || 0) + Number(expense.amount);
    });

    return {
      totalAmount,
      categoryTotals,
      monthlyTotals,
      averageAmount,
      expenseCount,
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      // Only show loading spinner if not refreshing
      if (!refreshing) {
        setLoading(true);
      }
      const [expensesResponse, categoriesData, statsData] = await Promise.all([
        expenseService.findAllByUser(),
        expenseService.getCategories(),
        expenseService.getStats(),
      ]);

      // Load planned expenses from API
      getPlannedExpenses();

      console.log('expensesResponse ===>', expensesResponse);

      const expensesData = expensesResponse.expenses;

      console.log('loadData callback - Loaded data:', {
        expensesCount: expensesData?.length || 0,
        categoriesCount: categoriesData?.length || 0,
        stats: statsData,
        firstExpense: expensesData?.[0]
      });

      setExpenses(expensesData || []);
      setCategories(categoriesData || []);
      setStats(statsData);

      // Initialize filtered stats with all expenses
      if (expensesData && expensesData.length > 0) {
        const initialFilteredStats = calculateStats(expensesData);
        setFilteredStats(initialFilteredStats);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load expenses');
    } finally {
      // Only hide loading spinner if we're not refreshing
      if (!refreshing) {
        setLoading(false);
      }
    }
  }, [calculateStats, refreshing, user?.id]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
      console.log('Data refreshed successfully');
      // Optional: Show a brief success message
      // Alert.alert('Success', 'Expenses refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const applyFilters = useCallback(() => {
    console.log('applyFilters called with:', {
      expensesCount: expenses.length,
      searchTerm,
      selectedCategory,
      filters
    });

    console.log('expenses ===>', expenses);

    let filtered = [...expenses];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        expense =>
          expense.description.toLowerCase().includes(term) ||
          expense.category.toLowerCase().includes(term) ||
          expenseService.formatCurrency(Number(expense.amount)).includes(term)
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
      filtered = filtered.filter(expense => Number(expense.amount) >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(expense => Number(expense.amount) <= filters.maxAmount!);
    }

    console.log('applyFilters result:', {
      originalCount: expenses.length,
      filteredCount: filtered.length,
      firstFiltered: filtered[0]
    });

    setFilteredExpenses(filtered);

    // Calculate filtered stats
    const newFilteredStats = calculateStats(filtered);
    console.log("newFilteredStats", newFilteredStats);
    setFilteredStats(newFilteredStats);

    console.log('Updated filtered stats:', newFilteredStats);

    // Group expenses by category
    const grouped: { [category: string]: Expense[] } = {};
    filtered.forEach(expense => {
      if (!grouped[expense.category]) {
        grouped[expense.category] = [];
      }
      grouped[expense.category].push(expense);
    });
    setGroupedExpenses(grouped);
  }, [expenses, filters, searchTerm, selectedCategory, calculateStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load planned expenses when component mounts or when switching to planned tab
  useEffect(() => {
    if (showPlannedExpenses) {
      getPlannedExpenses();
    }
  }, [showPlannedExpenses, getPlannedExpenses]);

  // Handle planned expense errors
  useEffect(() => {
    if (plannedExpensesError) {
      Alert.alert('Error', plannedExpensesError);
      clearPlannedExpenseError();
    }
  }, [plannedExpensesError, clearPlannedExpenseError]);



  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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
              await expenseService.delete(expense.id);
              await loadData();
              Alert.alert('Success', 'Expense deleted successfully');
            } catch {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
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

  // Planned expense helper functions
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6366F1';
    }
  };

  const getPriorityIcon = (priority: string): string => {
    switch (priority) {
      case 'high': return 'chevron-up-circle';
      case 'medium': return 'remove-circle';
      case 'low': return 'chevron-down-circle';
      default: return 'remove-circle';
    }
  };

  const calculatePlannedTotal = (): number => {
    console.log('plannedExpenses ===>', plannedExpenses);
    return plannedExpenses.filter(expense => expense !== undefined).reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  // Tab switching with animation
  const handleTabSwitch = (isPlanned: boolean) => {
    if (isPlanned === showPlannedExpenses) return; // No change needed

    // Animate content out
    Animated.timing(tabSlideAnim, {
      toValue: -20,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Switch tab
      setShowPlannedExpenses(isPlanned);

      // Animate content back in
      Animated.timing(tabSlideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // Add expense form handlers
  const handleFormChange = (field: keyof ExpenseFormData, value: string) => {
    setExpenseForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing (only for fields that can have errors)
    if (field in formErrors && formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmitExpense = async () => {
    try {
      setIsSubmitting(true);

      // Validate form
      const errors = expenseService.validateExpenseForm(expenseForm);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Create expense
      await expenseService.create(expenseForm, user?.id || '1');

      // Reset form and close modal
      setExpenseForm({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setFormErrors({});
      setShowAddModal(false);

      // Reload data
      await loadData();

      Alert.alert('Success', 'Expense added successfully!');
    } catch (error) {
      console.error('Failed to add expense:', error);
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setExpenseForm({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
  };

  const resetPlannedForm = () => {
    setPlannedExpenseForm({
      amount: '',
      category: '',
      description: '',
      plannedDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      isRecurring: false,
      notes: '',
    });
    setPlannedFormErrors({});
  };

  // Render functions
  const renderActualExpenses = () => {
    const data = Object.entries(groupedExpenses).map(([category, expenses]) => ({
      category,
      expenses,
    }));

    if (data.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={64} color="#6366F1" />
          <Text style={styles.emptyStateText}>No expenses found</Text>
          <Text style={styles.emptyStateSubtext}>Start tracking your spending</Text>
          <TouchableOpacity
            style={styles.addFirstExpenseButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addFirstExpenseText}>Add Your First Expense</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return data.map((item) => (
      <View key={item.category}>
        {renderCategorySection({ item })}
      </View>
    ));
  };

  const renderPlannedExpenses = () => {
    if (plannedExpenses.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#6366F1" />
          <Text style={styles.emptyStateText}>No planned expenses</Text>
          <Text style={styles.emptyStateSubtext}>Plan your future spending</Text>
          <TouchableOpacity
            style={styles.addFirstExpenseButton}
            onPress={() => setShowAddPlannedModal(true)}
          >
            <Text style={styles.addFirstExpenseText}>Add Your First Plan</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return plannedExpenses
      .filter(expense => expense !== undefined)
      .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())
      .map((expense) => (
        <View key={expense.id} style={styles.plannedExpenseCard}>
          <View style={styles.plannedExpenseHeader}>
            <View style={styles.plannedExpenseInfo}>
              <View style={styles.plannedExpenseTitle}>
                <Text style={styles.expenseDescription}>{expense.description}</Text>
                <View style={styles.plannedExpenseBadges}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(expense.priority) + '20' }]}>
                    <Ionicons
                      name={getPriorityIcon(expense.priority) as any}
                      size={12}
                      color={getPriorityColor(expense.priority)}
                    />
                    <Text style={[styles.priorityText, { color: getPriorityColor(expense.priority) }]}>
                      {expense.priority}
                    </Text>
                  </View>
                  {expense.isRecurring && (
                    <View style={styles.recurringBadge}>
                      <Ionicons name="repeat" size={12} color="#6366F1" />
                      <Text style={styles.recurringText}>Recurring</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.plannedExpenseCategory}>
                {getCategoryIcon(expense.category)} {expense.category}
              </Text>
              <Text style={styles.plannedExpenseDate}>
                📅 {formatDate(expense.plannedDate)}
              </Text>
              {expense.notes && (
                <Text style={styles.plannedExpenseNotes}>💡 {expense.notes}</Text>
              )}
            </View>
            <View style={styles.plannedExpenseAmount}>
              <Text style={styles.expenseAmount}>
                {expenseService.formatCurrency(expense.amount)}
              </Text>
            </View>
          </View>
          <View style={styles.plannedExpenseActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedExpenseForConversion(expense);
                setShowConvertModal(true);
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Edit planned expense functionality
                Alert.alert('Edit', 'Edit planned expense functionality coming soon');
              }}
            >
              <Ionicons name="create-outline" size={16} color="#6366F1" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Delete planned expense
                Alert.alert(
                  'Delete Planned Expense',
                  `Remove "${expense.description}" from your plans?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        removePlannedExpense(expense.id);
                      },
                    },
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      ));
  };



  const renderCategorySection = ({ item }: { item: { category: string; expenses: Expense[] } }) => {
    const categoryTotal = item.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

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
                {expenseService.formatCurrency(Number(expense.amount))}
              </Text>
            </View>

            <View style={styles.expenseFooter}>
              <View style={styles.expenseActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteExpense(expense)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderStats = () => {
    // Use filtered stats if available, otherwise fall back to original stats
    const currentStats = filteredStats || stats;
    if (!currentStats) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>💰 Financial Overview</Text>
          <Text style={styles.statsSubtitle}>
            {(searchTerm || selectedCategory) ? 'Filtered results' : 'AI-powered insights'}
          </Text>
        </View>
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setShowTotalSpentModal(true)}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="cash-outline" size={20} color="#6366F1" />
            </View>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>{expenseService.formatCurrency(currentStats.totalAmount)}</Text>
            <Ionicons name="chevron-forward" size={12} color="#9CA3AF" style={styles.statChevron} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setShowExpensesCountModal(true)}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="bar-chart-outline" size={20} color="#6366F1" />
            </View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{currentStats.expenseCount}</Text>
            <Ionicons name="chevron-forward" size={12} color="#9CA3AF" style={styles.statChevron} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setShowAverageModal(true)}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-up-outline" size={20} color="#6366F1" />
            </View>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{expenseService.formatCurrency(currentStats.averageAmount)}</Text>
            <Ionicons name="chevron-forward" size={12} color="#9CA3AF" style={styles.statChevron} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setShowCategoriesModal(true)}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="pricetag-outline" size={20} color="#6366F1" />
            </View>
            <Text style={styles.statLabel}>Categories</Text>
            <Text style={styles.statValue}>{Object.keys(currentStats.categoryTotals).length}</Text>
            <Ionicons name="chevron-forward" size={12} color="#9CA3AF" style={styles.statChevron} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Modal rendering functions
  const renderTotalSpentModal = () => (
    <Modal
      visible={showTotalSpentModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTotalSpentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💰 Total Spent Breakdown</Text>
            <TouchableOpacity onPress={() => setShowTotalSpentModal(false)}>
              <Ionicons name="close" size={24} color="#6366F1" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.totalSpentHeader}>
              <Text style={styles.totalSpentAmount}>
                {filteredStats && expenseService.formatCurrency(filteredStats.totalAmount)}
              </Text>
              <Text style={styles.totalSpentSubtext}>
                Total across {filteredExpenses.length} expenses
              </Text>
            </View>

            <View style={styles.expenseBreakdown}>
              <Text style={styles.breakdownTitle}>Recent Expenses</Text>
              {filteredExpenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((expense) => (
                  <View key={expense.id} style={styles.breakdownItem}>
                    <View style={styles.breakdownItemLeft}>
                      <Text style={styles.breakdownItemIcon}>
                        {getCategoryIcon(expense.category)}
                      </Text>
                      <View style={styles.breakdownItemInfo}>
                        <Text style={styles.breakdownItemTitle}>{expense.description}</Text>
                        <Text style={styles.breakdownItemDate}>{formatDate(expense.date)}</Text>
                      </View>
                    </View>
                    <Text style={styles.breakdownItemAmount}>
                      {expenseService.formatCurrency(Number(expense.amount))}
                    </Text>
                  </View>
                ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderExpensesCountModal = () => (
    <Modal
      visible={showExpensesCountModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowExpensesCountModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📊 All Expenses</Text>
            <TouchableOpacity onPress={() => setShowExpensesCountModal(false)}>
              <Ionicons name="close" size={24} color="#6366F1" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.expensesCountHeader}>
              <Text style={styles.expensesCountNumber}>
                {filteredExpenses.length}
              </Text>
              <Text style={styles.expensesCountSubtext}>Total Expenses</Text>
            </View>

            {/* Debug info */}
            {__DEV__ && (
              <Text style={styles.debugText}>
                Debug: {filteredExpenses.length} filtered, {expenses.length} total
              </Text>
            )}

            <View style={styles.expensesList}>
              {filteredExpenses.length === 0 ? (
                <View style={styles.emptyExpensesContainer}>
                  <Text style={styles.emptyExpensesText}>No expenses found</Text>
                  <Text style={styles.emptyExpensesSubtext}>
                    {expenses.length > 0 ? 'Try adjusting your filters' : 'Add your first expense to get started'}
                  </Text>
                </View>
              ) : (
                filteredExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((expense) => (
                    <View key={expense.id} style={styles.expenseListItem}>
                      <View style={styles.expenseListItemLeft}>
                        <View style={[styles.expenseListItemIcon, { backgroundColor: getCategoryColor(expense.category) + '20' }]}>
                          <Text style={styles.expenseListItemEmoji}>
                            {getCategoryIcon(expense.category)}
                          </Text>
                        </View>
                        <View style={styles.expenseListItemInfo}>
                          <Text style={styles.expenseListItemTitle}>{expense.description}</Text>
                          <Text style={styles.expenseListItemCategory}>{expense.category}</Text>
                          <Text style={styles.expenseListItemDate}>{formatDate(expense.date)}</Text>
                        </View>
                      </View>
                      <Text style={styles.expenseListItemAmount}>
                        {expenseService.formatCurrency(Number(expense.amount))}
                      </Text>
                    </View>
                  ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderAverageModal = () => {
    const currentStats = filteredStats || stats;
    if (!currentStats) return null;

    // Calculate monthly averages for the chart
    const monthlyData = Object.entries(currentStats.monthlyTotals).map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      amount: amount,
    }));

    const maxAmount = Math.max(...monthlyData.map(item => Number(item.amount)));

    return (
      <Modal
        visible={showAverageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAverageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📈 Average Spending</Text>
              <TouchableOpacity onPress={() => setShowAverageModal(false)}>
                <Ionicons name="close" size={24} color="#6366F1" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.averageHeader}>
                <Text style={styles.averageAmount}>
                  {expenseService.formatCurrency(currentStats.averageAmount)}
                </Text>
                <Text style={styles.averageSubtext}>Average per expense</Text>
              </View>

              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Monthly Spending Trend</Text>
                <View style={styles.chart}>
                  {monthlyData.map((item, index) => {
                    const barHeight = (Number(item.amount) / maxAmount) * 100;
                    return (
                      <View key={index} style={styles.chartBar}>
                        <View style={styles.chartBarContainer}>
                          <View
                            style={[
                              styles.chartBarFill,
                              { height: `${barHeight}%` }
                            ]}
                          />
                        </View>
                        <Text style={styles.chartBarLabel}>{item.month}</Text>
                        <Text style={styles.chartBarAmount}>
                          {expenseService.formatCurrency(Number(item.amount))}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.averageInsights}>
                <Text style={styles.insightsTitle}>Insights</Text>
                <View style={styles.insightItem}>
                  <Ionicons name="trending-up" size={16} color="#6366F1" />
                  <Text style={styles.insightText}>
                    You spend {expenseService.formatCurrency(currentStats.averageAmount)} on average per transaction
                  </Text>
                </View>
                <View style={styles.insightItem}>
                  <Ionicons name="calendar" size={16} color="#6366F1" />
                  <Text style={styles.insightText}>
                    Total of {currentStats.expenseCount} expenses tracked
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderCategoriesModal = () => {
    const currentStats = filteredStats || stats;
    if (!currentStats) return null;

    console.log("currentStats", currentStats.categoryTotals);

    const categoryData = Object.entries(currentStats.categoryTotals).map(([category, amount]) => ({
      name: category,
      amount: amount,
      expenses: filteredExpenses.filter(exp => exp.category === category),
      color: getCategoryColor(category),
      icon: getCategoryIcon(category),
    })).sort((a, b) => Number(b.amount) - Number(a.amount));

    return (
      <Modal
        visible={showCategoriesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoriesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏷️ Categories Breakdown</Text>
              <TouchableOpacity onPress={() => setShowCategoriesModal(false)}>
                <Ionicons name="close" size={24} color="#6366F1" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Category Tabs */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryTabs}
              >
                {categoryData.map((category, index) => (
                  <TouchableOpacity
                    key={category.name}
                    style={[
                      styles.categoryTab,
                      selectedCategoryTab === index && styles.categoryTabActive,
                    ]}
                    onPress={() => setSelectedCategoryTab(index)}
                  >
                    <Text style={styles.categoryTabIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryTabText,
                      selectedCategoryTab === index && styles.categoryTabTextActive,
                    ]}>
                      {category.name}
                    </Text>
                    <Text style={styles.categoryTabAmount}>
                      {expenseService.formatCurrency(Number(category.amount))}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Selected Category Content */}
              {categoryData[selectedCategoryTab] && (
                <ScrollView style={styles.categoryContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.categoryContentHeader}>
                    <View style={styles.categoryContentIcon}>
                      <Text style={styles.categoryContentEmoji}>
                        {categoryData[selectedCategoryTab].icon}
                      </Text>
                    </View>
                    <View style={styles.categoryContentInfo}>
                      <Text style={styles.categoryContentName}>
                        {categoryData[selectedCategoryTab].name}
                      </Text>
                      <Text style={styles.categoryContentAmount}>
                        {expenseService.formatCurrency(Number(categoryData[selectedCategoryTab].amount))}
                      </Text>
                      <Text style={styles.categoryContentCount}>
                        {categoryData[selectedCategoryTab].expenses.length} expenses
                      </Text>
                    </View>
                  </View>

                  <View style={styles.categoryExpensesList}>
                    {categoryData[selectedCategoryTab].expenses
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((expense) => (
                        <View key={expense.id} style={styles.categoryExpenseItem}>
                          <View style={styles.categoryExpenseInfo}>
                            <Text style={styles.categoryExpenseTitle}>{expense.description}</Text>
                            <Text style={styles.categoryExpenseDate}>{formatDate(expense.date)}</Text>
                          </View>
                          <Text style={styles.categoryExpenseAmount}>
                            {expenseService.formatCurrency(Number(expense.amount))}
                          </Text>
                        </View>
                      ))}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderAddExpenseModal = () => (
    <Modal
      visible={showAddModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Expense</Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6366F1" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Amount Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[styles.formInput, styles.amountInput]}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  value={expenseForm.amount}
                  onChangeText={(value) => handleFormChange('amount', value)}
                  keyboardType="numeric"
                />
              </View>
              {formErrors.amount && (
                <Text style={styles.errorText}>{formErrors.amount}</Text>
              )}
            </View>

            {/* Description Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.formInput}
                placeholder="What was this expense for?"
                placeholderTextColor="#9CA3AF"
                value={expenseForm.description}
                onChangeText={(value) => handleFormChange('description', value)}
              />
              {formErrors.description && (
                <Text style={styles.errorText}>{formErrors.description}</Text>
              )}
            </View>

            {/* Category Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categorySelection}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      expenseForm.category === category.name && styles.categoryOptionActive,
                    ]}
                    onPress={() => handleFormChange('category', category.name)}
                  >
                    <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryOptionText,
                      expenseForm.category === category.name && styles.categoryOptionTextActive,
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {formErrors.category && (
                <Text style={styles.errorText}>{formErrors.category}</Text>
              )}
            </View>

            {/* Date Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <TextInput
                style={styles.formInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={expenseForm.date}
                onChangeText={(value) => handleFormChange('date', value)}
              />
              {formErrors.date && (
                <Text style={styles.errorText}>{formErrors.date}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmitExpense}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>Adding...</Text>
              ) : (
                <Text style={styles.submitButtonText}>Add Expense</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderAddPlannedExpenseModal = () => (
    <Modal
      visible={showAddPlannedModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAddPlannedModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Planned Expense</Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddPlannedModal(false);
                resetPlannedForm();
              }}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6366F1" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Amount Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[styles.formInput, styles.amountInput]}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  value={plannedExpenseForm.amount}
                  onChangeText={(value) => setPlannedExpenseForm(prev => ({ ...prev, amount: value }))}
                  keyboardType="numeric"
                />
              </View>
              {plannedFormErrors.amount && (
                <Text style={styles.errorText}>{plannedFormErrors.amount}</Text>
              )}
            </View>

            {/* Description Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.formInput}
                placeholder="What is this planned expense for?"
                placeholderTextColor="#9CA3AF"
                value={plannedExpenseForm.description}
                onChangeText={(value) => setPlannedExpenseForm(prev => ({ ...prev, description: value }))}
              />
              {plannedFormErrors.description && (
                <Text style={styles.errorText}>{plannedFormErrors.description}</Text>
              )}
            </View>

            {/* Category Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categorySelection}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      plannedExpenseForm.category === category.name && styles.categoryOptionActive,
                    ]}
                    onPress={() => setPlannedExpenseForm(prev => ({ ...prev, category: category.name }))}
                  >
                    <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryOptionText,
                      plannedExpenseForm.category === category.name && styles.categoryOptionTextActive,
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {plannedFormErrors.category && (
                <Text style={styles.errorText}>{plannedFormErrors.category}</Text>
              )}
            </View>

            {/* Planned Date Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Planned Date</Text>
              <TextInput
                style={styles.formInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={plannedExpenseForm.plannedDate}
                onChangeText={(value) => setPlannedExpenseForm(prev => ({ ...prev, plannedDate: value }))}
              />
              {plannedFormErrors.plannedDate && (
                <Text style={styles.errorText}>{plannedFormErrors.plannedDate}</Text>
              )}
            </View>

            {/* Priority Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.prioritySelection}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      plannedExpenseForm.priority === priority && styles.priorityOptionActive,
                    ]}
                    onPress={() => setPlannedExpenseForm(prev => ({ ...prev, priority: priority as 'low' | 'medium' | 'high' }))}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      plannedExpenseForm.priority === priority && styles.priorityOptionTextActive,
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recurring Toggle */}
            <View style={styles.formGroup}>
              <View style={styles.toggleContainer}>
                <Text style={styles.formLabel}>Recurring Expense</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    plannedExpenseForm.isRecurring && styles.toggleButtonActive,
                  ]}
                  onPress={() => setPlannedExpenseForm(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                >
                  <Text style={styles.toggleText}>
                    {plannedExpenseForm.isRecurring ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.formInput, styles.notesInput]}
                placeholder="Add any additional notes..."
                placeholderTextColor="#9CA3AF"
                value={plannedExpenseForm.notes}
                onChangeText={(value) => setPlannedExpenseForm(prev => ({ ...prev, notes: value }))}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={async () => {
                try {
                  // Create the planned expense using the API
                  const plannedExpenseData: CreatePlannedExpenseDto = {
                    amount: parseFloat(plannedExpenseForm.amount) || 0,
                    category: plannedExpenseForm.category,
                    description: plannedExpenseForm.description,
                    plannedDate: plannedExpenseForm.plannedDate,
                    priority: plannedExpenseForm.priority,
                    isRecurring: plannedExpenseForm.isRecurring || false,
                    notes: plannedExpenseForm.notes || '',
                  };

                  console.log("plannedExpenseData", plannedExpenseData);

                  await addPlannedExpense(plannedExpenseData);
                  setShowAddPlannedModal(false);
                  resetPlannedForm();
                  Alert.alert('Success', 'Planned expense added successfully!');
                } catch (error) {
                  console.error('Failed to add planned expense:', error);
                  Alert.alert('Error', 'Failed to add planned expense');
                }
              }}
            >
              <Text style={styles.submitButtonText}>Add Planned Expense</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderConvertModal = () => (
    <Modal
      visible={showConvertModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowConvertModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Convert to Actual Expense</Text>
            <TouchableOpacity
              onPress={() => {
                setShowConvertModal(false);
                setSelectedExpenseForConversion(null);
                setConversionDate(new Date().toISOString().split('T')[0]);
                setConversionNotes('');
              }}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6366F1" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {selectedExpenseForConversion && (
              <>
                {/* Expense Info */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Planned Expense</Text>
                  <View style={styles.expenseCard}>
                    <Text style={styles.expenseDescription}>
                      {selectedExpenseForConversion.description}
                    </Text>
                    <Text style={styles.expenseAmount}>
                      {expenseService.formatCurrency(selectedExpenseForConversion.amount)}
                    </Text>
                    <Text style={styles.expenseDate}>
                      {getCategoryIcon(selectedExpenseForConversion.category)} {selectedExpenseForConversion.category}
                    </Text>
                  </View>
                </View>

                {/* Actual Date Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Actual Date</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    value={conversionDate}
                    onChangeText={setConversionDate}
                  />
                </View>

                {/* Notes Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Additional Notes (Optional)</Text>
                  <TextInput
                    style={[styles.formInput, styles.notesInput]}
                    placeholder="Add any additional notes for the actual expense..."
                    placeholderTextColor="#9CA3AF"
                    value={conversionNotes}
                    onChangeText={setConversionNotes}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Convert Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={async () => {
                    try {
                      const convertDto = {
                        plannedExpenseId: selectedExpenseForConversion.id,
                        actualDate: conversionDate,
                        notes: conversionNotes || selectedExpenseForConversion.notes || '',
                      };

                      await convertPlannedExpenseToActual(convertDto, user?.id || '1');
                      setShowConvertModal(false);
                      setSelectedExpenseForConversion(null);
                      setConversionDate(new Date().toISOString().split('T')[0]);
                      setConversionNotes('');

                      // Refresh both expenses and planned expenses
                      await loadData();

                      // Also refresh planned expenses specifically
                      getPlannedExpenses();

                      Alert.alert('Success', 'Planned expense converted to actual expense!');
                    } catch (error) {
                      console.error('Failed to convert planned expense:', error);
                      Alert.alert('Error', 'Failed to convert planned expense');
                    }
                  }}
                >
                  <Text style={styles.submitButtonText}>Convert to Actual Expense</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>💰 Expenses</Text>
              <Text style={styles.subtitle}>Smart financial management</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => showPlannedExpenses ? setShowAddPlannedModal(true) : setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, !showPlannedExpenses && styles.tabActive]}
              onPress={() => handleTabSwitch(false)}
            >
              <View style={[styles.tabIconContainer, !showPlannedExpenses && styles.tabIconContainerActive]}>
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color={!showPlannedExpenses ? "#6366F1" : "#9CA3AF"}
                />
              </View>
              <Text style={[styles.tabText, !showPlannedExpenses && styles.tabTextActive]}>
                Actual
              </Text>
              <Text style={[styles.tabSubtext, !showPlannedExpenses && styles.tabSubtextActive]}>
                {expenses.length} expenses
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, showPlannedExpenses && styles.tabActive]}
              onPress={() => handleTabSwitch(true)}
            >
              <View style={[styles.tabIconContainer, showPlannedExpenses && styles.tabIconContainerActive]}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={showPlannedExpenses ? "#6366F1" : "#9CA3AF"}
                />
              </View>
              <Text style={[styles.tabText, showPlannedExpenses && styles.tabTextActive]}>
                Planned
              </Text>
              <Text style={[styles.tabSubtext, showPlannedExpenses && styles.tabSubtextActive]}>
                {plannedExpenses.length} planned
              </Text>
            </TouchableOpacity>


          </View>

          {/* Search and Filters */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={16} color="#9CA3AF" />
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
              <Ionicons name="filter" size={16} color="#FFFFFF" />
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

          {/* Scrollable Content: Stats + Expenses */}
          <ScrollView
            style={styles.scrollableContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollableContentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#6366F1"
                colors={["#6366F1"]}
                progressBackgroundColor="rgba(255, 255, 255, 0.1)"
              />
            }
          >
            {/* Animated Content */}
            <Animated.View
              style={[
                styles.tabContent,
                {
                  transform: [{ translateY: tabSlideAnim }],
                  opacity: tabSlideAnim.interpolate({
                    inputRange: [-20, 0],
                    outputRange: [0.7, 1],
                  }),
                }
              ]}
            >
              {/* Stats */}
              {!showPlannedExpenses && (
                <>
                  {renderStats()}


                </>
              )}

              {/* Planned Expenses Summary */}
              {showPlannedExpenses && (
                <>
                  <View style={styles.plannedSummaryContainer}>
                    <Text style={styles.plannedSummaryTitle}>📅 Planning Summary</Text>
                    <View style={styles.plannedSummaryCard}>
                      <Text style={styles.plannedTotalAmount}>
                        {expenseService.formatCurrency(calculatePlannedTotal())}
                      </Text>
                      <Text style={styles.plannedTotalLabel}>Total Planned</Text>
                      <Text style={styles.plannedTotalSubtext}>
                        {plannedExpenses.length} upcoming expenses
                      </Text>
                    </View>
                  </View>


                </>
              )}

              {/* Content List */}
              <View style={styles.expensesListContainer}>
                {showPlannedExpenses ? renderPlannedExpenses() : renderActualExpenses()}
              </View>
            </Animated.View>
          </ScrollView>

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
                    <Ionicons name="close" size={24} color="#6366F1" />
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

          {/* Add Expense Modal */}
          {renderAddExpenseModal()}

          {/* Add Planned Expense Modal */}
          {renderAddPlannedExpenseModal()}

          {/* Convert Planned Expense Modal */}
          {renderConvertModal()}



          {/* Stats Modals */}
          {renderTotalSpentModal()}
          {renderExpensesCountModal()}
          {renderAverageModal()}
          {renderCategoriesModal()}
        </Animated.View>


      </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryFilter: {
    marginBottom: 20,
    maxHeight: 40,
  },
  scrollableContent: {
    flex: 1,
  },
  scrollableContentContainer: {
    paddingBottom: 120, // Add space for the bottom tab bar
  },
  expensesListContainer: {
    flex: 1,
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
    maxHeight: 40,
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
  statChevron: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  expensesList: {
    // Removed flex: 1 since it's no longer a FlatList
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 16,
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
    padding: 4,
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
  // Add expense form styles
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  categorySelection: {
    marginTop: 8,
  },
  categoryOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    minWidth: 80,
  },
  categoryOptionActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  categoryOptionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  categoryOptionTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Total Spent Modal Styles
  totalSpentHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  totalSpentAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 8,
  },
  totalSpentSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  expenseBreakdown: {
    flex: 1,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  breakdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  breakdownItemInfo: {
    flex: 1,
  },
  breakdownItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  breakdownItemDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  breakdownItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
  },

  // Expenses Count Modal Styles
  expensesCountHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  expensesCountNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 8,
  },
  expensesCountSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  expenseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  expenseListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseListItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseListItemEmoji: {
    fontSize: 18,
  },
  expenseListItemInfo: {
    flex: 1,
  },
  expenseListItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  expenseListItemCategory: {
    fontSize: 12,
    color: '#6366F1',
    marginBottom: 2,
  },
  expenseListItemDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  expenseListItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
  },

  // Average Modal Styles
  averageHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  averageAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 8,
  },
  averageSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingHorizontal: 16,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    height: 120,
    width: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  chartBarFill: {
    backgroundColor: '#6366F1',
    borderRadius: 10,
    width: '100%',
  },
  chartBarLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  chartBarAmount: {
    fontSize: 10,
    color: '#6366F1',
    fontWeight: '600',
  },
  averageInsights: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
    flex: 1,
  },

  // Categories Modal Styles
  categoryTabs: {
    marginBottom: 20,
  },
  categoryTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    minWidth: 100,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  categoryTabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryTabText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryTabTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  categoryTabAmount: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  categoryContent: {
    flex: 1,
  },
  categoryContentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  categoryContentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContentEmoji: {
    fontSize: 28,
  },
  categoryContentInfo: {
    flex: 1,
  },
  categoryContentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryContentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 2,
  },
  categoryContentCount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  categoryExpensesList: {
    flex: 1,
  },
  categoryExpenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryExpenseInfo: {
    flex: 1,
  },
  categoryExpenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  categoryExpenseDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoryExpenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366F1',
  },

  // Debug and Empty States
  debugText: {
    fontSize: 12,
    color: '#FF6B6B',
    textAlign: 'center',
    marginVertical: 8,
    fontFamily: 'monospace',
  },
  emptyExpensesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyExpensesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyExpensesSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Tab Navigation Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  tabActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  tabContent: {
    flex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  tabTextActive: {
    color: '#6366F1',
  },
  tabSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  tabSubtextActive: {
    color: '#8B5CF6',
  },


  plannedSummaryContainer: {
    marginBottom: 20,
  },
  plannedSummaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  plannedSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  plannedTotalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 8,
  },
  plannedTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  plannedTotalSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  plannedExpenseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  plannedExpenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  plannedExpenseInfo: {
    flex: 1,
    marginRight: 16,
  },
  plannedExpenseTitle: {
    marginBottom: 8,
  },
  plannedExpenseBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    gap: 4,
  },
  recurringText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  plannedExpenseCategory: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  plannedExpenseDate: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginBottom: 4,
  },
  plannedExpenseNotes: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  plannedExpenseAmount: {
    alignItems: 'flex-end',
  },
  plannedExpenseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  notesInput: {
    height: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  prioritySelection: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  priorityOptionActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priorityOptionTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  frequencySelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 70,
  },
  frequencyOptionActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  frequencyOptionText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  frequencyOptionTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    gap: 4,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },

});

export default ExpensesScreen; 