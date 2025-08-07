import {
  Category,
  CategoryInsert,
  CategoryUpdate,
  Event,
  EventInsert,
  EventUpdate,
  Expense,
  ExpenseInsert,
  ExpenseUpdate,
  supabase,
} from "./supabase";

export interface DataResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  success: boolean;
  data?: T[];
  count?: number;
  error?: string;
}

class DataService {
  // Events
  async getEvents(userId: string): Promise<PaginatedResult<Event>> {
    try {
      const { data, error, count } = await supabase
        .from("events")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("start_date", { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        count: count || 0,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch events",
      };
    }
  }

  async getEvent(id: string): Promise<DataResult<Event>> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch event",
      };
    }
  }

  async createEvent(event: EventInsert): Promise<DataResult<Event>> {
    try {
      const { data, error } = await supabase
        .from("events")
        .insert(event)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create event",
      };
    }
  }

  async updateEvent(
    id: string,
    updates: EventUpdate
  ): Promise<DataResult<Event>> {
    try {
      const { data, error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update event",
      };
    }
  }

  async deleteEvent(id: string): Promise<DataResult<void>> {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete event",
      };
    }
  }

  // Expenses
  async getExpenses(
    userId: string,
    eventId?: string
  ): Promise<PaginatedResult<Expense>> {
    try {
      let query = supabase
        .from("expenses")
        .select(
          `
          *,
          categories (
            id,
            name,
            color
          ),
          events (
            id,
            title
          )
        `,
          { count: "exact" }
        )
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (eventId) {
        query = query.eq("event_id", eventId);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        count: count || 0,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch expenses",
      };
    }
  }

  async getExpense(id: string): Promise<DataResult<Expense>> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
          *,
          categories (
            id,
            name,
            color
          ),
          events (
            id,
            title
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch expense",
      };
    }
  }

  async createExpense(expense: ExpenseInsert): Promise<DataResult<Expense>> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert(expense)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create expense",
      };
    }
  }

  async updateExpense(
    id: string,
    updates: ExpenseUpdate
  ): Promise<DataResult<Expense>> {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update expense",
      };
    }
  }

  async deleteExpense(id: string): Promise<DataResult<void>> {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete expense",
      };
    }
  }

  // Categories
  async getCategories(userId: string): Promise<PaginatedResult<Category>> {
    try {
      const { data, error, count } = await supabase
        .from("categories")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("name", { ascending: true });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        count: count || 0,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch categories",
      };
    }
  }

  async createCategory(
    category: CategoryInsert
  ): Promise<DataResult<Category>> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert(category)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create category",
      };
    }
  }

  async updateCategory(
    id: string,
    updates: CategoryUpdate
  ): Promise<DataResult<Category>> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update category",
      };
    }
  }

  async deleteCategory(id: string): Promise<DataResult<void>> {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete category",
      };
    }
  }

  // Analytics
  async getExpenseAnalytics(
    userId: string,
    startDate?: string,
    endDate?: string
  ) {
    try {
      let query = supabase
        .from("expenses")
        .select(
          `
          amount,
          date,
          categories (
            name,
            color
          )
        `
        )
        .eq("user_id", userId);

      if (startDate) {
        query = query.gte("date", startDate);
      }
      if (endDate) {
        query = query.lte("date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate analytics
      const totalAmount =
        data?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const categoryTotals =
        data?.reduce((acc, expense) => {
          const categoryName = expense.categories?.[0]?.name || "Uncategorized";
          acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
          return acc;
        }, {} as Record<string, number>) || {};

      return {
        success: true,
        data: {
          totalAmount,
          categoryTotals,
          expenses: data || [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch analytics",
      };
    }
  }
}

export const dataService = new DataService();
export default dataService;
