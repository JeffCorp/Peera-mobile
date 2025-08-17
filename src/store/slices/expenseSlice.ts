import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "../../api/client";
import { API_ENDPOINTS } from "../../config/env";
import {
  CreatePlannedExpenseDto,
  Expense,
  ExpenseCategory,
  ExpenseFilters,
  ExpenseStats,
  PlannedExpense,
  PlannedExpenseQueryDto,
  PlannedExpenseStats,
  UpdatePlannedExpenseDto,
} from "../../services/expenseService";

// Types
export interface ExpenseState {
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  categories: ExpenseCategory[];
  stats: ExpenseStats | null;
  plannedExpenseStats: PlannedExpenseStats | null;
  filters: ExpenseFilters;
  isLoading: boolean;
  error: string | null;
  selectedExpense: Expense | null;
  selectedPlannedExpense: PlannedExpense | null;
}

// Initial state
const initialState: ExpenseState = {
  expenses: [],
  plannedExpenses: [],
  categories: [],
  stats: null,
  plannedExpenseStats: null,
  filters: {},
  isLoading: false,
  error: null,
  selectedExpense: null,
  selectedPlannedExpense: null,
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

// Planned Expense Async Thunks
export const fetchPlannedExpenses = createAsyncThunk(
  "expenses/fetchPlannedExpenses",
  async (query: PlannedExpenseQueryDto | undefined, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = query
        ? `${API_ENDPOINTS.EXPENSES}/planned?${queryParams}`
        : `${API_ENDPOINTS.EXPENSES}/planned`;
      console.log("url", url);
      const response = await apiClient.get(url);
      console.log("planned expenses", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch planned expenses"
      );
    }
  }
);

export const createPlannedExpense = createAsyncThunk(
  "expenses/createPlannedExpense",
  async (expenseData: CreatePlannedExpenseDto, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.EXPENSES}/planned`,
        expenseData
      );
      console.log("createPlannedExpense response", response.data);
      return response.data;
    } catch (error: any) {
      console.log("createPlannedExpense error", error.response.data);
      return rejectWithValue(
        error.message || "Failed to create planned expense"
      );
    }
  }
);

export const updatePlannedExpense = createAsyncThunk(
  "expenses/updatePlannedExpense",
  async (
    { id, data }: { id: string; data: UpdatePlannedExpenseDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.patch(
        `${API_ENDPOINTS.EXPENSES}/planned/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update planned expense"
      );
    }
  }
);

export const deletePlannedExpense = createAsyncThunk(
  "expenses/deletePlannedExpense",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`${API_ENDPOINTS.EXPENSES}/planned/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to delete planned expense"
      );
    }
  }
);

export const fetchPlannedExpenseStats = createAsyncThunk(
  "expenses/fetchPlannedExpenseStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.EXPENSES}/planned/stats`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch planned expense stats"
      );
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
    setSelectedPlannedExpense: (
      state,
      action: PayloadAction<PlannedExpense | null>
    ) => {
      state.selectedPlannedExpense = action.payload;
    },
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload);
    },
    addPlannedExpense: (state, action: PayloadAction<PlannedExpense>) => {
      state.plannedExpenses.unshift(action.payload);
    },
    updateExpenseInList: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex(
        (expense) => expense.id === action.payload.id
      );
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },
    updatePlannedExpenseInList: (
      state,
      action: PayloadAction<PlannedExpense>
    ) => {
      const index = state.plannedExpenses.findIndex(
        (plannedExpense) => plannedExpense.id === action.payload.id
      );
      if (index !== -1) {
        state.plannedExpenses[index] = action.payload;
      }
    },
    removeExpenseFromList: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== action.payload
      );
    },
    removePlannedExpenseFromList: (state, action: PayloadAction<string>) => {
      state.plannedExpenses = state.plannedExpenses.filter(
        (plannedExpense) => plannedExpense.id !== action.payload
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

    // Fetch Planned Expenses
    builder
      .addCase(fetchPlannedExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlannedExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plannedExpenses =
          action.payload.plannedExpenses || action.payload || [];
        state.error = null;
      })
      .addCase(fetchPlannedExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Planned Expense
    builder
      .addCase(createPlannedExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPlannedExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle array response from createPlannedExpense
        if (Array.isArray(action.payload)) {
          state.plannedExpenses.unshift(...action.payload);
        } else {
          state.plannedExpenses.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createPlannedExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Planned Expense
    builder
      .addCase(updatePlannedExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePlannedExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.plannedExpenses.findIndex(
          (plannedExpense) => plannedExpense.id === action.payload.id
        );
        if (index !== -1) {
          state.plannedExpenses[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePlannedExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Planned Expense
    builder
      .addCase(deletePlannedExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePlannedExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plannedExpenses = state.plannedExpenses.filter(
          (plannedExpense) => plannedExpense.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deletePlannedExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Planned Expense Stats
    builder
      .addCase(fetchPlannedExpenseStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlannedExpenseStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plannedExpenseStats = action.payload;
        state.error = null;
      })
      .addCase(fetchPlannedExpenseStats.rejected, (state, action) => {
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
  setSelectedPlannedExpense,
  addExpense,
  addPlannedExpense,
  updateExpenseInList,
  updatePlannedExpenseInList,
  removeExpenseFromList,
  removePlannedExpenseFromList,
} = expenseSlice.actions;

export default expenseSlice.reducer;
