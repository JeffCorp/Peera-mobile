import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CreatePlannedExpenseDto,
  PlannedExpense,
  PlannedExpenseQueryDto,
  UpdatePlannedExpenseDto,
} from "../services/expenseService";
import { RootState } from "../store";
import {
  clearError,
  createPlannedExpense,
  deletePlannedExpense,
  fetchPlannedExpenses,
  fetchPlannedExpenseStats,
  setSelectedPlannedExpense,
  updatePlannedExpense,
} from "../store/slices/expenseSlice";

export const usePlannedExpenses = () => {
  const dispatch = useDispatch<any>();
  const {
    plannedExpenses,
    plannedExpenseStats,
    isLoading,
    error,
    selectedPlannedExpense,
  } = useSelector((state: RootState) => state.expenses);

  const getPlannedExpenses = useCallback(
    (query?: PlannedExpenseQueryDto) => {
      dispatch(fetchPlannedExpenses(query));
    },
    [dispatch]
  );

  const addPlannedExpense = useCallback(
    (expenseData: CreatePlannedExpenseDto) => {
      return dispatch(createPlannedExpense(expenseData));
    },
    [dispatch]
  );

  const editPlannedExpense = useCallback(
    (id: string, expenseData: UpdatePlannedExpenseDto) => {
      return dispatch(updatePlannedExpense({ id, data: expenseData }));
    },
    [dispatch]
  );

  const removePlannedExpense = useCallback(
    (id: string) => {
      return dispatch(deletePlannedExpense(id));
    },
    [dispatch]
  );

  const getPlannedExpenseStats = useCallback(() => {
    dispatch(fetchPlannedExpenseStats());
  }, [dispatch]);

  const selectPlannedExpense = useCallback(
    (expense: PlannedExpense | null) => {
      dispatch(setSelectedPlannedExpense(expense));
    },
    [dispatch]
  );

  const clearPlannedExpenseError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    plannedExpenses,
    plannedExpenseStats,
    isLoading,
    error,
    selectedPlannedExpense,

    // Actions
    getPlannedExpenses,
    addPlannedExpense,
    editPlannedExpense,
    removePlannedExpense,
    getPlannedExpenseStats,
    selectPlannedExpense,
    clearPlannedExpenseError,
  };
};
