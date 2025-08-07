// Environment Configuration
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  PROJECT_ID: process.env.EXPO_PUBLIC_PROJECT_ID || null,
  IS_DEV: __DEV__,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh",
  LOGOUT: "/auth/logout",

  // User
  PROFILE: "/users/profile",
  UPDATE_PROFILE: "/users/profile",

  // Expenses
  EXPENSES: "/expenses",
  EXPENSE_BY_ID: (id: string) => `/expenses/${id}`,
  EXPENSE_CATEGORIES: "/expenses/categories",

  // Calendar
  EVENTS: "/events",
  EVENT_BY_ID: (id: string) => `/events/${id}`,

  // Voice
  VOICE_PROCESS: "/voice/process",
  VOICE_TRANSCRIBE: "/voice/transcribe",
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "Resource not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNKNOWN_ERROR: "An unknown error occurred.",
} as const;
