import { NavigatorScreenParams } from "@react-navigation/native";

// Auth Stack Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Types
export type MainTabParamList = {
  home: undefined;
  calendar: undefined;
  voice: undefined;
  chat: undefined;
  expenses: undefined;
  profile: undefined;
};

// Home Stack Types
export type HomeStackParamList = {
  HomeMain: undefined;
  Dashboard: undefined;
  Notifications: undefined;
  Settings: undefined;
};

// Calendar Stack Types
export type CalendarStackParamList = {
  CalendarMain: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
};

// Voice Stack Types
export type VoiceStackParamList = {
  VoiceMain: undefined;
  VoiceHistory: undefined;
  VoiceSettings: undefined;
  VoiceRecording: undefined;
};

// Expenses Stack Types
export type ExpensesStackParamList = {
  ExpensesMain: undefined;
  ExpenseDetails: { expenseId: string };
  CreateExpense: undefined;
  EditExpense: { expenseId: string };
  Categories: undefined;
  CategoryDetails: { categoryId: string };
  CreateCategory: undefined;
  EditCategory: { categoryId: string };
  Analytics: undefined;
};

// Profile Stack Types
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  PrivacySettings: undefined;
  HelpSupport: undefined;
  About: undefined;
};

// Root Stack Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Loading: undefined;
};

// Combined Navigation Types
export type AppNavigationParamList = RootStackParamList;

// Navigation Props Types
export type NavigationProps<T extends keyof AppNavigationParamList> = {
  navigation: any; // Will be properly typed when used with useNavigation
  route: {
    params: AppNavigationParamList[T];
  };
};

// Tab Bar Icon Props
export interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

// Screen Options Types
export interface ScreenOptions {
  headerShown?: boolean;
  headerTitle?: string;
  headerStyle?: object;
  headerTintColor?: string;
  headerTitleStyle?: object;
  tabBarIcon?: (props: TabBarIconProps) => React.ReactNode;
  tabBarLabel?: string;
  tabBarActiveTintColor?: string;
  tabBarInactiveTintColor?: string;
  tabBarStyle?: object;
}

// Navigation State Types
export interface NavigationState {
  index: number;
  routeNames: string[];
  routes: {
    key: string;
    name: string;
    params?: any;
  }[];
}

// Route Params Types
export interface RouteParams {
  eventId?: string;
  expenseId?: string;
  categoryId?: string;
  userId?: string;
}

// Navigation Events
export type NavigationEvent = "focus" | "blur" | "beforeRemove" | "state";

// Navigation Listeners
export interface NavigationListener {
  (event: NavigationEvent, callback: () => void): () => void;
}

// Deep Linking Types
export interface DeepLinkConfig {
  screens: {
    [key: string]: {
      screens?: {
        [key: string]: string;
      };
    };
  };
}

// Navigation Theme Types
export interface NavigationTheme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
}
