import moment from "moment";
import apiClient from "../api/client";

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  receiptUri?: string;
  calendarEventId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  searchTerm?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseStats {
  totalAmount: number;
  categoryTotals: { [category: string]: number };
  monthlyTotals: { [month: string]: number };
  averageAmount: number;
  expenseCount: number;
}

export interface ExpenseFormData {
  amount: string;
  category: string;
  description: string;
  date: string;
  receiptUri?: string;
  calendarEventId?: string;
}

export interface FormErrors {
  amount?: string;
  category?: string;
  description?: string;
  date?: string;
}

class ExpenseService {
  private expenses: Expense[] = [];
  private categories: ExpenseCategory[] = [
    { id: "1", name: "Food & Dining", icon: "🍽️", color: "#FF6B6B" },
    { id: "2", name: "Transportation", icon: "🚗", color: "#4ECDC4" },
    { id: "3", name: "Shopping", icon: "🛍️", color: "#45B7D1" },
    { id: "4", name: "Entertainment", icon: "🎬", color: "#96CEB4" },
    { id: "5", name: "Healthcare", icon: "🏥", color: "#FFEAA7" },
    { id: "6", name: "Utilities", icon: "⚡", color: "#DDA0DD" },
    { id: "7", name: "Housing", icon: "🏠", color: "#98D8C8" },
    { id: "8", name: "Education", icon: "📚", color: "#F7DC6F" },
    { id: "9", name: "Travel", icon: "✈️", color: "#BB8FCE" },
    { id: "10", name: "Other", icon: "📦", color: "#85C1E9" },
  ];

  /**
   * Get all expenses
   */
  async getExpenses(userId: string): Promise<Expense[]> {
    try {
      // In a real app, this would fetch from API/database
      return this.expenses.filter((expense) => expense.userId === userId);
    } catch (error) {
      console.error("Failed to get expenses:", error);
      throw new Error("Failed to load expenses");
    }
  }

  /**
   * Get expenses with filters
   */
  async getExpensesWithFilters(
    userId: string,
    filters: ExpenseFilters
  ): Promise<Expense[]> {
    try {
      let filteredExpenses = this.expenses.filter(
        (expense) => expense.userId === userId
      );

      // Apply date range filter
      if (filters.startDate) {
        filteredExpenses = filteredExpenses.filter(
          (expense) => new Date(expense.date) >= new Date(filters.startDate!)
        );
      }
      if (filters.endDate) {
        filteredExpenses = filteredExpenses.filter(
          (expense) => new Date(expense.date) <= new Date(filters.endDate!)
        );
      }

      // Apply category filter
      if (filters.category) {
        filteredExpenses = filteredExpenses.filter(
          (expense) => expense.category === filters.category
        );
      }

      // Apply amount range filter
      if (filters.minAmount !== undefined) {
        filteredExpenses = filteredExpenses.filter(
          (expense) => expense.amount >= filters.minAmount!
        );
      }
      if (filters.maxAmount !== undefined) {
        filteredExpenses = filteredExpenses.filter(
          (expense) => expense.amount <= filters.maxAmount!
        );
      }

      // Apply search filter
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredExpenses = filteredExpenses.filter(
          (expense) =>
            expense.description.toLowerCase().includes(searchTerm) ||
            expense.category.toLowerCase().includes(searchTerm)
        );
      }

      return filteredExpenses.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error("Failed to get filtered expenses:", error);
      throw new Error("Failed to load filtered expenses");
    }
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id: string): Promise<Expense | null> {
    try {
      return this.expenses.find((expense) => expense.id === id) || null;
    } catch (error) {
      console.error("Failed to get expense:", error);
      throw new Error("Failed to load expense");
    }
  }

  /**
   * Create new expense
   */
  async createExpense(
    userId: string,
    expenseData: ExpenseFormData
  ): Promise<Expense> {
    try {
      const newExpense: Expense = {
        id: Date.now().toString(),
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        description: expenseData.description,
        date: expenseData.date,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(expenseData.receiptUri && { receiptUri: expenseData.receiptUri }),
        ...(expenseData.calendarEventId && {
          calendarEventId: expenseData.calendarEventId,
        }),
      };

      this.expenses.push(newExpense);
      return newExpense;
    } catch (error) {
      console.error("Failed to create expense:", error);
      throw new Error("Failed to create expense");
    }
  }

  /**
   * Update expense
   */
  async updateExpense(
    id: string,
    expenseData: Partial<ExpenseFormData>
  ): Promise<Expense> {
    try {
      const expenseIndex = this.expenses.findIndex(
        (expense) => expense.id === id
      );
      if (expenseIndex === -1) {
        throw new Error("Expense not found");
      }

      const updatedExpense = {
        ...this.expenses[expenseIndex],
        ...(expenseData.amount && { amount: parseFloat(expenseData.amount) }),
        ...(expenseData.category && { category: expenseData.category }),
        ...(expenseData.description && {
          description: expenseData.description,
        }),
        ...(expenseData.date && { date: expenseData.date }),
        ...(expenseData.receiptUri !== undefined && {
          receiptUri: expenseData.receiptUri,
        }),
        ...(expenseData.calendarEventId !== undefined && {
          calendarEventId: expenseData.calendarEventId,
        }),
        updatedAt: new Date().toISOString(),
      };

      this.expenses[expenseIndex] = updatedExpense;
      return updatedExpense;
    } catch (error) {
      console.error("Failed to update expense:", error);
      throw new Error("Failed to update expense");
    }
  }

  /**
   * Delete expense
   */
  async deleteExpense(id: string): Promise<void> {
    try {
      const expenseIndex = this.expenses.findIndex(
        (expense) => expense.id === id
      );
      if (expenseIndex === -1) {
        throw new Error("Expense not found");
      }

      this.expenses.splice(expenseIndex, 1);
    } catch (error) {
      console.error("Failed to delete expense:", error);
      throw new Error("Failed to delete expense");
    }
  }

  /**
   * Get expense statistics
   */
  async getExpenseStats(
    userId: string,
    filters?: ExpenseFilters
  ): Promise<ExpenseStats> {
    try {
      let expenses = this.expenses.filter(
        (expense) => expense.userId === userId
      );

      if (filters) {
        expenses = await this.getExpensesWithFilters(userId, filters);
      }

      const totalAmount = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      const categoryTotals: { [category: string]: number } = {};
      const monthlyTotals: { [month: string]: number } = {};

      expenses.forEach((expense) => {
        // Category totals
        categoryTotals[expense.category] =
          (categoryTotals[expense.category] || 0) + expense.amount;

        // Monthly totals
        const month = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM
        monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
      });

      return {
        totalAmount,
        categoryTotals,
        monthlyTotals,
        averageAmount: expenses.length > 0 ? totalAmount / expenses.length : 0,
        expenseCount: expenses.length,
      };
    } catch (error) {
      console.error("Failed to get expense stats:", error);
      throw new Error("Failed to load expense statistics");
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<ExpenseCategory[]> {
    try {
      const response = await apiClient.get("/expenses/categories");

      if (!response || !response.data) {
        // Fallback to local categories if API fails
        return this.categories;
      }

      return response.data;
    } catch (error) {
      console.error("Failed to get categories:", error);
      // Fallback to local categories if API fails
      return this.categories;
    }
  }

  /**
   * Add new category
   */
  async addCategory(
    category: Omit<ExpenseCategory, "id">
  ): Promise<ExpenseCategory> {
    try {
      const newCategory: ExpenseCategory = {
        ...category,
        id: Date.now().toString(),
      };

      this.categories.push(newCategory);
      return newCategory;
    } catch (error) {
      console.error("Failed to add category:", error);
      throw new Error("Failed to add category");
    }
  }

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    updates: Partial<ExpenseCategory>
  ): Promise<ExpenseCategory> {
    try {
      const categoryIndex = this.categories.findIndex((cat) => cat.id === id);
      if (categoryIndex === -1) {
        throw new Error("Category not found");
      }

      this.categories[categoryIndex] = {
        ...this.categories[categoryIndex],
        ...updates,
      };

      return this.categories[categoryIndex];
    } catch (error) {
      console.error("Failed to update category:", error);
      throw new Error("Failed to update category");
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const categoryIndex = this.categories.findIndex((cat) => cat.id === id);
      if (categoryIndex === -1) {
        throw new Error("Category not found");
      }

      // Check if category is being used
      const isUsed = this.expenses.some(
        (expense) => expense.category === this.categories[categoryIndex].name
      );
      if (isUsed) {
        throw new Error(
          "Cannot delete category that is being used by expenses"
        );
      }

      this.categories.splice(categoryIndex, 1);
    } catch (error) {
      console.error("Failed to delete category:", error);
      throw new Error("Failed to delete category");
    }
  }

  /**
   * Validate expense form data
   */
  validateExpenseForm(data: ExpenseFormData): FormErrors {
    const errors: FormErrors = {};

    // Validate amount
    if (!data.amount || data.amount.trim() === "") {
      errors.amount = "Amount is required";
    } else {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = "Please enter a valid amount greater than 0";
      }
    }

    // Validate category
    if (!data.category || data.category.trim() === "") {
      errors.category = "Category is required";
    }

    // Validate description
    if (!data.description || data.description.trim() === "") {
      errors.description = "Description is required";
    } else if (data.description.length > 200) {
      errors.description = "Description must be less than 200 characters";
    }

    // Validate date
    if (!data.date || data.date.trim() === "") {
      errors.date = "Date is required";
    } else {
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        errors.date = "Please enter a valid date";
      }
    }

    return errors;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  /**
   * Get expenses grouped by category
   */
  async getExpensesByCategory(
    userId: string,
    filters?: ExpenseFilters
  ): Promise<{ [category: string]: Expense[] }> {
    try {
      const expenses = filters
        ? await this.getExpensesWithFilters(userId, filters)
        : await this.getExpenses(userId);

      const grouped: { [category: string]: Expense[] } = {};

      expenses.forEach((expense) => {
        if (!grouped[expense.category]) {
          grouped[expense.category] = [];
        }
        grouped[expense.category].push(expense);
      });

      return grouped;
    } catch (error) {
      console.error("Failed to group expenses by category:", error);
      throw new Error("Failed to group expenses");
    }
  }

  /**
   * Get recent expenses
   */
  async getRecentExpenses(
    userId: string,
    limit: number = 10
  ): Promise<Expense[]> {
    try {
      const expenses = await this.getExpenses(userId);
      return expenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error("Failed to get recent expenses:", error);
      throw new Error("Failed to load recent expenses");
    }
  }

  /**
   * Find all expenses by user with query parameters
   */
  async findAllByUser(query: any = {}): Promise<{
    expenses: Expense[];
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  }> {
    try {
      console.log("query ===>", query);

      const response = await apiClient.get("/expenses", {
        params: {
          ...query,
        },
      });

      console.log("Response: => ", response);

      if (!response) {
        throw new Error("Failed to find expenses");
      }

      console.log("Response.data ===>", response.data);

      // Handle the backend response format (based on your provided response)
      return {
        expenses: response.data || [],
        total: response.data.total || 0,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      };
    } catch (error) {
      console.error("Failed to find expenses by user:", error);
      throw new Error("Failed to load expenses");
    }
  }

  /**
   * Find expense by ID with user validation
   */
  async findById(id: string, userId: string): Promise<Expense> {
    try {
      const response = await apiClient.get(`/expenses/${id}`);

      if (!response || !response.data) {
        throw new Error("Expense not found");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to find expense by ID:", error);
      throw new Error("Failed to load expense");
    }
  }

  /**
   * Find expenses by category
   */
  async findByCategory(userId: string, category: string): Promise<Expense[]> {
    try {
      const response = await apiClient.get(
        `/expenses/by-category/${encodeURIComponent(category)}`
      );

      if (!response || !response.data) {
        return [];
      }

      return response.data.expenses || [];
    } catch (error) {
      console.error("Failed to find expenses by category:", error);
      throw new Error("Failed to load expenses by category");
    }
  }

  /**
   * Find expenses by date range
   */
  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Expense[]> {
    try {
      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const response = await apiClient.get(
        `/expenses/date-range/${startDateStr}/${endDateStr}`
      );

      if (!response || !response.data) {
        return [];
      }

      return response.data.expenses || [];
    } catch (error) {
      console.error("Failed to find expenses by date range:", error);
      throw new Error("Failed to load expenses by date range");
    }
  }

  /**
   * Create new expense (updated to match controller interface)
   */
  async create(expenseData: ExpenseFormData, userId: string): Promise<Expense> {
    try {
      const newExpense = {
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        description: expenseData.description,
        date: expenseData.date,
        ...(expenseData.receiptUri && { receiptUri: expenseData.receiptUri }),
        ...(expenseData.calendarEventId && {
          calendarEventId: expenseData.calendarEventId,
        }),
      };

      console.log("New expense:", newExpense);

      // Add api call to create expense
      const response = await apiClient.post("/expenses", newExpense);

      console.log("Response: => ", response);
      if (!response) {
        throw new Error("Failed to create expense");
      }

      console.log("Created expense:", response);

      // Add expense to local expenses
      this.expenses.push(response.data as Expense);

      const expenseResponse = response.data as Expense;
      return expenseResponse;
    } catch (error) {
      console.error("Failed to create expense:", error);
      throw new Error("Failed to create expense");
    }
  }

  /**
   * Update expense (updated to match controller interface)
   */
  async update(
    id: string,
    expenseData: Partial<ExpenseFormData>,
    userId: string
  ): Promise<Expense> {
    try {
      const updateData = {
        ...(expenseData.amount && { amount: parseFloat(expenseData.amount) }),
        ...(expenseData.category && { category: expenseData.category }),
        ...(expenseData.description && {
          description: expenseData.description,
        }),
        ...(expenseData.date && { date: expenseData.date }),
        ...(expenseData.receiptUri !== undefined && {
          receiptUri: expenseData.receiptUri,
        }),
        ...(expenseData.calendarEventId !== undefined && {
          calendarEventId: expenseData.calendarEventId,
        }),
      };

      const response = await apiClient.patch(`/expenses/${id}`, updateData);

      if (!response || !response.data) {
        throw new Error("Failed to update expense");
      }

      return response.data;
    } catch (error) {
      console.error("Failed to update expense:", error);
      throw new Error("Failed to update expense");
    }
  }

  /**
   * Delete expense (updated to match controller interface)
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/expenses/${id}`);

      console.log("Response: => ", response);

      if (response) {
        throw new Error("Failed to delete expense");
      }
    } catch (error) {
      console.error("Failed to delete expense:", error);
      throw new Error("Failed to delete expense");
    }
  }

  /**
   * Get expense statistics with optional date range
   */
  async getStats(startDate?: string, endDate?: string): Promise<any> {
    // ExpenseStats & {
    //   currentPeriod: ExpenseStats;
    //   previousPeriod?: ExpenseStats;
    //   growthRate?: number;
    // }
    try {
      const params = new URLSearchParams();
      if (startDate) {
        // Validate and format the provided start date
        const validStartDate = new Date(startDate);
        if (isNaN(validStartDate.getTime())) {
          throw new Error("Invalid start date provided");
        }
        params.append("startDate", validStartDate.toISOString());
      } else {
        // Default to start of current day
        params.append("startDate", moment().startOf("day").toISOString());
      }

      if (endDate) {
        // Validate and format the provided end date
        const validEndDate = new Date(endDate);
        if (isNaN(validEndDate.getTime())) {
          throw new Error("Invalid end date provided");
        }
        params.append("endDate", validEndDate.toISOString());
      } else {
        // Default to end of current day
        params.append("endDate", moment().endOf("day").toISOString());
      }

      const url = `/expenses/stats${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      console.log("URL: => ", url);

      const response = await apiClient.get(url);

      console.log("Response Stats: => ", response);

      if (!response) {
        throw new Error("Failed to get stats");
      }

      return response;
    } catch (error) {
      console.error("Failed to get expense stats:", error);
      throw new Error("Failed to load expense statistics");
    }
  }
}

export const expenseService = new ExpenseService();
export default expenseService;
