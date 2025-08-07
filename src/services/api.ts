import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_CONFIG, API_ENDPOINTS } from "../constants";
import { ApiResponse, PaginatedResponse } from "../types";
import { getErrorMessage } from "../utils/helpers";

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh or logout
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  // POST request
  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  // PUT request
  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }

  // PATCH request
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PATCH", url, data });
  }

  // Auth methods
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.post<ApiResponse<{ token: string; user: any }>>(
      API_ENDPOINTS.auth.login,
      { email, password }
    );
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.post<ApiResponse<{ token: string; user: any }>>(
      API_ENDPOINTS.auth.register,
      userData
    );
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>(API_ENDPOINTS.auth.logout);
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.post<ApiResponse<{ token: string }>>(
      API_ENDPOINTS.auth.refresh
    );
  }

  // Conversation methods
  async getConversations(): Promise<PaginatedResponse<any>> {
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.conversations.list);
  }

  async getConversation(id: string): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>(API_ENDPOINTS.conversations.get(id));
  }

  async createConversation(title: string): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(API_ENDPOINTS.conversations.create, {
      title,
    });
  }

  async updateConversation(
    id: string,
    data: Partial<any>
  ): Promise<ApiResponse<any>> {
    return this.put<ApiResponse<any>>(
      API_ENDPOINTS.conversations.update(id),
      data
    );
  }

  async deleteConversation(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(
      API_ENDPOINTS.conversations.delete(id)
    );
  }

  // Chat methods
  async sendMessage(
    conversationId: string,
    content: string
  ): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(API_ENDPOINTS.chat.send, {
      conversationId,
      content,
    });
  }

  // User methods
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.get<ApiResponse<any>>(API_ENDPOINTS.user.profile);
  }

  async updateUserPreferences(preferences: any): Promise<ApiResponse<any>> {
    return this.put<ApiResponse<any>>(
      API_ENDPOINTS.user.preferences,
      preferences
    );
  }
}

export const apiService = new ApiService();
export default apiService;
