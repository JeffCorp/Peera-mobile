// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    h1: any;
    h2: any;
    h3: any;
    body: any;
    caption: any;
  };
}

// API Types
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

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
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

// Expense Types
export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  receiptUri?: string;
  calendarEventId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  searchTerm?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseStats {
  totalAmount: number;
  categoryTotals: { [category: string]: number };
  monthlyTotals: { [month: string]: number };
  averageAmount: number;
  expenseCount: number;
}

export interface ExpenseFormData {
  amount: string;
  category: string;
  description: string;
  date: string;
  receiptUri?: string;
  calendarEventId?: string;
}

export interface ExpenseFormErrors {
  amount?: string;
  category?: string;
  description?: string;
  date?: string;
}

// Planned Expense Types
export interface PlannedExpense {
  id: string;
  amount: number;
  category: string;
  description: string;
  plannedDate: string;
  priority: "low" | "medium" | "high";
  isRecurring: boolean;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlannedExpenseDto {
  amount: number;
  category: string;
  description: string;
  plannedDate: string;
  priority: "low" | "medium" | "high";
  isRecurring?: boolean;
  notes?: string;
}

export interface UpdatePlannedExpenseDto {
  amount?: number;
  category?: string;
  description?: string;
  plannedDate?: string;
  priority?: "low" | "medium" | "high";
  isRecurring?: boolean;
  notes?: string;
}

export interface PlannedExpenseQueryDto {
  startDate?: string;
  endDate?: string;
  category?: string;
  priority?: string;
  isRecurring?: boolean;
  page?: number;
  limit?: number;
}

export interface PlannedExpenseStats {
  totalPlannedAmount: number;
  activePlannedAmount: number;
  categoryTotals: { [category: string]: number };
  priorityBreakdown: { [priority: string]: number };
  upcomingPlannedExpenses: PlannedExpense[];
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isAllDay: boolean;
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isAllDay: boolean;
  color?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

// Voice Types
export interface VoiceCommand {
  id: string;
  transcription: string;
  response: string;
  timestamp: string;
  userId: string;
}

export interface ProcessVoiceData {
  audioFile: any;
  transcription?: string;
}

// Camera Types
export interface CameraResult {
  uri: string;
  width: number;
  height: number;
  type: "image" | "video";
}

export interface CameraOptions {
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  mediaTypes?: "photo" | "video" | "all";
  maxWidth?: number;
  maxHeight?: number;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AddExpense: undefined;
  EditExpense: { expenseId: string };
  ExpenseDetails: { expenseId: string };
  Calendar: undefined;
  AddEvent: undefined;
  EditEvent: { eventId: string };
  EventDetails: { eventId: string };
  Voice: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Expenses: undefined;
  Calendar: undefined;
  Voice: undefined;
  Profile: undefined;
};

// Redux State Types
export interface RootState {
  auth: AuthState;
  expenses: ExpenseState;
  calendar: CalendarState;
  voice: VoiceState;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ExpenseState {
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  categories: ExpenseCategory[];
  stats: ExpenseStats | null;
  plannedExpenseStats: PlannedExpenseStats | null;
  filters: ExpenseFilters;
  isLoading: boolean;
  error: string | null;
  selectedExpense: Expense | null;
  selectedPlannedExpense: PlannedExpense | null;
}

export interface CalendarState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  isLoading: boolean;
  error: string | null;
  selectedDate: string | null;
}

export interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  isLoading: boolean;
  transcription: string;
  response: string;
  error: string | null;
  recentCommands: VoiceCommand[];
  recordingDuration: number;
}

// Component Props Types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  style?: any;
}

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "decimal-pad";
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  prefix?: string;
  suffix?: string;
  style?: any;
}

export interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  disabled?: boolean;
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
}

// Utility Types
export type LoadingState = "idle" | "loading" | "success" | "error";

export type SortOrder = "asc" | "desc";

export type FilterType = "all" | "category" | "date" | "amount";

export type ThemeMode = "light" | "dark" | "system";

// Form Types
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "select"
    | "textarea";
  required?: boolean;
  validation?: (value: any) => string | undefined;
  options?: { label: string; value: any }[];
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchResponse<T> {
  data: T[];
  total: number;
  query: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Settings Types
export interface AppSettings {
  theme: ThemeMode;
  language: string;
  currency: string;
  notifications: {
    enabled: boolean;
    expenses: boolean;
    calendar: boolean;
    voice: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    shareCrashReports: boolean;
  };
}

// All types are defined in this file
