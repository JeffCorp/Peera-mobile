import { useCallback, useEffect, useState } from "react";
import {
  authService,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
} from "../services/auth";
import { User } from "../services/supabase";

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        const user = await authService.getCurrentUser();

        setAuthState({
          user,
          session,
          loading: false,
        });
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);

      if (session) {
        const user = await authService.getCurrentUser();
        setAuthState({
          user,
          session,
          loading: false,
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.login(credentials);

      if (result.success) {
        setError(null);
        return { success: true };
      } else {
        setError(result.error || "Login failed");
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.register(credentials);

      if (result.success) {
        setError(null);
        return { success: true };
      } else {
        setError(result.error || "Registration failed");
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.logout();

      if (result.success) {
        setError(null);
        return { success: true };
      } else {
        setError(result.error || "Logout failed");
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.resetPassword(email);

      if (result.success) {
        setError(null);
        return { success: true };
      } else {
        setError(result.error || "Password reset failed");
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Password reset failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.updateProfile(updates);

      if (result.success) {
        // Refresh user data
        const user = await authService.getCurrentUser();
        setAuthState((prev) => ({ ...prev, user }));
        setError(null);
        return { success: true };
      } else {
        setError(result.error || "Profile update failed");
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Profile update failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    user: authState.user,
    session: authState.session,
    isAuthenticated: !!authState.user,
    loading: authState.loading || loading,
    error,

    // Actions
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    clearError,
  };
};
