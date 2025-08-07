// App Configuration
export const APP_CONFIG = {
  name: "Executive AI Assistant",
  version: "1.0.0",
  buildNumber: "1",
} as const;

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || "https://api.executive-ai.com",
  timeout: 30000,
  retryAttempts: 3,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  conversations: {
    list: "/conversations",
    create: "/conversations",
    get: (id: string) => `/conversations/${id}`,
    update: (id: string) => `/conversations/${id}`,
    delete: (id: string) => `/conversations/${id}`,
    messages: (id: string) => `/conversations/${id}/messages`,
  },
  chat: {
    send: "/chat/send",
    stream: "/chat/stream",
  },
  user: {
    profile: "/user/profile",
    preferences: "/user/preferences",
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  auth: {
    token: "auth_token",
    refreshToken: "auth_refresh_token",
    user: "auth_user",
  },
  app: {
    theme: "app_theme",
    language: "app_language",
    onboarding: "app_onboarding_complete",
  },
  conversations: {
    list: "conversations_list",
    current: "current_conversation",
  },
} as const;

// Theme Colors
export const COLORS = {
  light: {
    primary: "#007AFF",
    secondary: "#5856D6",
    background: "#FFFFFF",
    surface: "#F2F2F7",
    text: "#000000",
    textSecondary: "#8E8E93",
    border: "#C6C6C8",
    error: "#FF3B30",
    success: "#34C759",
    warning: "#FF9500",
  },
  dark: {
    primary: "#0A84FF",
    secondary: "#5E5CE6",
    background: "#000000",
    surface: "#1C1C1E",
    text: "#FFFFFF",
    textSecondary: "#8E8E93",
    border: "#38383A",
    error: "#FF453A",
    success: "#30D158",
    warning: "#FF9F0A",
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Typography
export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: "normal",
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: "normal",
    lineHeight: 20,
  },
} as const;

// Animation
export const ANIMATION = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
} as const;

// Validation
export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
} as const;
