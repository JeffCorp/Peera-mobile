import axios from "axios";
import { User } from "./supabase";

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Dummy user data
const dummyUsers: User[] = [
  {
    id: "1",
    email: "test@example.com",
    full_name: "Test User",
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    email: "admin@example.com",
    full_name: "Admin User",
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class AuthService {
  private currentUser: User | null = null;
  private currentSession: any = null;

  // Get current session
  async getCurrentSession(): Promise<any | null> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.currentSession;
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.currentUser;
  }

  // Sign up with email and password
  async register(credentials: RegisterCredentials): Promise<AuthResult> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUser = dummyUsers.find(
      (user) => user.email === credentials.email
    );
    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Create new user
    const newUser: User = {
      id: (dummyUsers.length + 1).toString(),
      email: credentials.email,
      full_name: credentials.full_name || null,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to dummy users
    dummyUsers.push(newUser);

    // Set as current user
    this.currentUser = newUser;
    this.currentSession = { user: newUser };

    return {
      success: true,
      data: { user: newUser, session: this.currentSession },
    };
  }

  // Sign in with email and password
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Find user by email
    const result = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
      credentials
    );
    console.log(
      "AuthService - Login result:",
      `${process.env.EXPO_PUBLIC_API_URL}/auth/login`
    );
    console.log("AuthService - Login result:", result.data);
    const { user, session } = result.data;

    // const user = dummyUsers.find((u) => u.email === credentials.email);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Simple password check (in real app, this would be hashed)
    // if (credentials.password !== "password123") {
    //   return {
    //     success: false,
    //     error: "Invalid password",
    //   };
    // }

    // Set as current user
    this.currentUser = user;
    this.currentSession = { user };

    return {
      success: true,
      data: { user, session: this.currentSession },
    };
  }

  // Sign out
  async logout(): Promise<AuthResult> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Clear current user and session
    this.currentUser = null;
    this.currentSession = null;

    return {
      success: true,
    };
  }

  // Reset password
  async resetPassword(email: string): Promise<AuthResult> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 300));

    const user = dummyUsers.find((u) => u.email === email);
    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
    };
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<AuthResult> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!this.currentUser) {
      return {
        success: false,
        error: "No authenticated user",
      };
    }

    // Update user
    Object.assign(this.currentUser, updates, {
      updated_at: new Date().toISOString(),
    });

    return {
      success: true,
    };
  }

  // Listen to auth state changes (dummy implementation)
  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Return a dummy subscription
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            // Dummy unsubscribe
          },
        },
      },
    };
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    return !!this.currentUser;
  }
}

export const authService = new AuthService();
export default authService;
