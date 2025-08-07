import * as SecureStore from "expo-secure-store";
import { apiClient, AuthTokens } from "../../api/client";
import { API_ENDPOINTS } from "../../config/env";

// Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  success: boolean;
  data?: AuthResponse;
  error?: string;
}

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
} as const;

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response: any = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      console.log("AuthService - Login response:", response);

      if (response.user && response.accessToken) {
        // Store tokens and user data
        await this.storeAuthData(response);
        return { success: true, data: response };
      } else {
        return { success: false, error: "Login failed" };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  }

  // Register user
  async register(userData: RegisterData): Promise<AuthResult> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.REGISTER,
        userData
      );

      if (response.success && response.data) {
        // Store tokens and user data
        await this.storeAuthData(response.data);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: "Registration failed" };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  }

  // Logout user
  async logout(): Promise<AuthResult> {
    try {
      // Call logout endpoint
      await apiClient.post(API_ENDPOINTS.LOGOUT);

      return { success: true };
    } catch (error) {
      // Continue with local cleanup even if API call fails
      console.warn("Logout API call failed, continuing with local cleanup");
    }

    // Clear local data
    await this.clearAuthData();
    return { success: true };
  }

  // Refresh token
  async refreshToken(): Promise<AuthResult> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return { success: false, error: "No refresh token available" };
      }

      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.REFRESH_TOKEN,
        {
          refreshToken,
        }
      );

      if (response.success && response.data) {
        // Store new tokens
        await this.storeAuthData(response.data);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: "Token refresh failed" };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Token refresh failed",
      };
    }
  }

  // Get current user profile
  async getProfile(): Promise<AuthResult> {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.PROFILE);

      if (response.success && response.data) {
        // Update stored user data
        await this.storeUserData(response.data);
        const tokens = await this.getTokens();
        if (tokens) {
          return {
            success: true,
            data: {
              user: response.data,
              accessToken: tokens?.accessToken,
              refreshToken: tokens?.refreshToken,
            },
          };
        } else {
          return { success: false, error: "No tokens available" };
        }
      } else {
        return { success: false, error: "Failed to get profile" };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get profile",
      };
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<AuthResult> {
    try {
      const response = await apiClient.put<User>(
        API_ENDPOINTS.UPDATE_PROFILE,
        updates
      );

      if (response.success && response.data) {
        // Update stored user data
        await this.storeUserData(response.data);
        const tokens = await this.getTokens();
        if (tokens) {
          return {
            success: true,
            data: {
              user: response.data,
              accessToken: tokens?.accessToken,
              refreshToken: tokens?.refreshToken,
            },
          };
        } else {
          return { success: false, error: "No tokens available" };
        }
      } else {
        return { success: false, error: "Failed to update profile" };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to update profile",
      };
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const userData = await this.getUserData();
      return !!(accessToken && userData);
    } catch (error) {
      return false;
    }
  }

  // Auto-login on app startup
  async autoLogin(): Promise<AuthResult> {
    try {
      const accessToken = await this.getAccessToken();
      const userData = await this.getUserData();

      if (!accessToken || !userData) {
        return { success: false, error: "No stored auth data" };
      }

      // Verify token is still valid by getting profile
      const profileResult = await this.getProfile();
      if (profileResult.success) {
        return profileResult;
      } else {
        // Token might be expired, try to refresh
        const refreshResult = await this.refreshToken();
        if (refreshResult.success) {
          return refreshResult;
        } else {
          // Clear invalid data
          await this.clearAuthData();
          return { success: false, error: "Session expired" };
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Auto-login failed",
      };
    }
  }

  // Store authentication data
  private async storeAuthData(authData: AuthResponse): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, authData.accessToken),
      SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, authData.refreshToken),
      SecureStore.setItemAsync(
        TOKEN_KEYS.USER_DATA,
        JSON.stringify(authData.user)
      ),
    ]);
  }

  // Store user data only
  private async storeUserData(user: User): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEYS.USER_DATA, JSON.stringify(user));
  }

  // Clear all authentication data
  private async clearAuthData(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(TOKEN_KEYS.USER_DATA),
    ]);
  }

  // Get access token
  private async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  // Get refresh token
  private async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  // Get stored tokens
  private async getTokens(): Promise<AuthTokens | null> {
    try {
      const accessToken = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();

      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
      return null;
    } catch (error) {
      console.error("Error getting tokens:", error);
      return null;
    }
  }

  // Get user data
  private async getUserData(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(TOKEN_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
