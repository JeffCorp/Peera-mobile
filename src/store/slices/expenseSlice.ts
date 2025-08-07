import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "../../api/client";
import { API_ENDPOINTS } from "../../config/env";
import {
  Expense,
  ExpenseCategory,
  ExpenseFilters,
  ExpenseStats,
} from "../../services/expenseService";

// Types
export interface ExpenseState {
  expenses: Expense[];
  categories: ExpenseCategory[];
  stats: ExpenseStats | null;
  filters: ExpenseFilters;
  isLoading: boolean;
  error: string | null;
  selectedExpense: Expense | null;
}

// Initial state
const initialState: ExpenseState = {
  expenses: [],
  categories: [],
  stats: null,
  filters: {},
  isLoading: false,
  error: null,
  selectedExpense: null,
};

// Async thunks
export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (filters: ExpenseFilters | undefined, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = filters
        ? `${API_ENDPOINTS.EXPENSES}?${queryParams}`
        : API_ENDPOINTS.EXPENSES;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch expenses");
    }
  }
);

export const createExpense = createAsyncThunk(
  "expenses/createExpense",
  async (expenseData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.EXPENSES,
        expenseData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create expense");
    }
  }
);

export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.EXPENSE_BY_ID(id),
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update expense");
    }
  }
);

export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(API_ENDPOINTS.EXPENSE_BY_ID(id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete expense");
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "expenses/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EXPENSE_CATEGORIES);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch categories");
    }
  }
);

export const fetchExpenseStats = createAsyncThunk(
  "expenses/fetchStats",
  async (filters: ExpenseFilters | undefined, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = filters
        ? `${API_ENDPOINTS.EXPENSES}/stats?${queryParams}`
        : `${API_ENDPOINTS.EXPENSES}/stats`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch expense stats");
    }
  }
);

// Expense slice
const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<ExpenseFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedExpense: (state, action: PayloadAction<Expense | null>) => {
      state.selectedExpense = action.payload;
    },
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload);
    },
    updateExpenseInList: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex(
        (expense) => expense.id === action.payload.id
      );
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },
    removeExpenseFromList: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    // Fetch Expenses
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Expense
    builder
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses.unshift(action.payload);
        state.error = null;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Expense
    builder
      .addCase(updateExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.expenses.findIndex(
          (expense) => expense.id === action.payload.id
        );
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Expense
    builder
      .addCase(deleteExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = state.expenses.filter(
          (expense) => expense.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Stats
    builder
      .addCase(fetchExpenseStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenseStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenseStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setSelectedExpense,
  addExpense,
  updateExpenseInList,
  removeExpenseFromList,
} = expenseSlice.actions;

export default expenseSlice.reducer;
