import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { API_ENDPOINTS, ENV, ERROR_MESSAGES, HTTP_STATUS } from "../config/env";

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: ENV.API_URL || "",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        console.log("Requesting => ", config.url);
        const token = await this.getAccessToken();
        if (token) {
          console.log("Adding token => ", token);
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.log("Error => ", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log("Response => ", response);
        return response;
      },
      async (error: AxiosError) => {
        console.log("Axios Error => ", error);
        const originalRequest = error.config as any;

        if (
          error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
          !originalRequest._retry
        ) {
          // if (this.isRefreshing) {
          //   console.log("Refreshing token");
          //   // return new Promise((resolve, reject) => {
          //   //   this.failedQueue.push({ resolve, reject });
          //   // })
          //   //   .then((token) => {
          //   //     console.log("Token => ", token);
          //   //     originalRequest.headers.Authorization = `Bearer ${token}`;
          //   //     return this.client(originalRequest);
          //   //   })
          //   //   .catch((err) => {
          //   //     console.log("Erroro => ", err);
          //   //     return Promise.reject(err);
          //   //   });
          //   const refreshToken = await this.getRefreshToken();
          //   if (!refreshToken) {
          //     throw new Error("No refresh token available");
          //   }
          //   const getnewTokens = await this.refreshAuthToken(refreshToken);
          //   console.log("New tokens => ", getnewTokens);
          //   return getnewTokens;
          // }

          // originalRequest._retry = true;
          // this.isRefreshing = true;

          try {
            const refreshToken = await this.getRefreshToken();
            console.log("Refresho token => ", refreshToken);
            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            const response = await this.refreshAuthToken(refreshToken);
            const { accessToken } = response.data.data;

            console.log("New Access token => ", accessToken);

            await this.setAccessToken(accessToken);
            this.client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

            return this.client(originalRequest);
          } catch (refreshError) {
            // Clear tokens and redirect to login
            // await this.clearTokens();
            // this.failedQueue.forEach(({ reject }) => {
            //   reject(refreshError);
            // });
            // this.failedQueue = [];

            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        console.log("error => ", error);

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      return {
        message: data?.message || this.getErrorMessage(status),
        status,
        code: data?.code,
      };
    } else if (error.request) {
      // Network error
      return {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        status: 0,
        code: "NETWORK_ERROR",
      };
    } else {
      // Other error
      return {
        message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
        status: 0,
        code: "UNKNOWN_ERROR",
      };
    }
  }

  private getErrorMessage(status: number): string {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_MESSAGES.FORBIDDEN;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  // Token management
  private async getAccessToken(): Promise<string | null> {
    try {
      console.log("Getting access token from secure store");
      const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
      console.log("Access token => ", token);
      return token;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  private async getRefreshToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
      console.log("Refresh token => ", token);
      return token;
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  private async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error("Error setting access token:", error);
    }
  }

  private async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error("Error setting refresh token:", error);
    }
  }

  public async setTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      this.setAccessToken(tokens.accessToken),
      this.setRefreshToken(tokens.refreshToken),
    ]);
  }

  public async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN),
      ]);
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }

  // API methods
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Auth methods
  private async refreshAuthToken(
    refreshToken: string
  ): Promise<AxiosResponse<ApiResponse<AuthTokens>>> {
    return this.client.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
  }

  // File upload
  public async uploadFile<T = any>(
    url: string,
    file: any,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.client.post<ApiResponse<T>>(url, formData, {
        ...config,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.get("/health");
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
