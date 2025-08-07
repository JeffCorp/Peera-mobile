// UI Components
export { Button } from "./components/ui/Button";
export { Input } from "./components/ui/Input";
export { LoadingScreen } from "./components/ui/LoadingScreen";

// Navigation Components
export { default as TabBarIcon } from "./components/navigation/TabBarIcon";
export { default as MainTabNavigator } from "./navigation/MainTabNavigator";
export { default as RootNavigator } from "./navigation/RootNavigator";

// Services
export { apiService } from "./services/api";
export { authService } from "./services/auth";
export { dataService } from "./services/data";
export { storageService } from "./services/storage";
export { supabase } from "./services/supabase";

// Hooks
export { useTheme } from "./hooks/useTheme";

// Contexts
export { AuthProvider, useAuth } from "./contexts/AuthContext";

// Components
export { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Types
export type {
  ApiResponse,
  BaseComponentProps,
  Conversation,
  Message,
  MessageMetadata,
  PaginatedResponse,
  Theme,
  User,
  UserPreferences,
} from "./types";

// Navigation Types
export type {
  AppNavigationParamList,
  AuthStackParamList,
  CalendarStackParamList,
  DeepLinkConfig,
  ExpensesStackParamList,
  HomeStackParamList,
  MainTabParamList,
  NavigationEvent,
  NavigationListener,
  NavigationProps,
  NavigationState,
  NavigationTheme,
  ProfileStackParamList,
  RootStackParamList,
  RouteParams,
  ScreenOptions,
  TabBarIconProps,
  VoiceStackParamList,
} from "./types/navigation";

// Constants
export {
  ANIMATION,
  API_CONFIG,
  API_ENDPOINTS,
  APP_CONFIG,
  COLORS,
  SPACING,
  STORAGE_KEYS,
  TYPOGRAPHY,
  VALIDATION,
} from "./constants";

// Utils
export {
  capitalize,
  chunk,
  deepClone,
  delay,
  formatDate,
  formatTime,
  generateId,
  getErrorMessage,
  isAndroid,
  isIOS,
  isValidEmail,
  isValidPassword,
  retry,
  safeJsonParse,
  safeJsonStringify,
  truncate,
  unique,
} from "./utils/helpers";

// Styles
export { createGlobalStyles } from "./styles/globalStyles";
export { darkTheme, getTheme, lightTheme } from "./styles/theme";
