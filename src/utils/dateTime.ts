import { Platform } from "react-native";

// Date formatting utilities
export const formatDate = (
  date: Date,
  format: "short" | "long" | "time" | "datetime" = "short"
): string => {
  const options: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case "short":
      options.month = "short";
      options.day = "numeric";
      break;
    case "long":
      options.weekday = "long";
      options.year = "numeric";
      options.month = "long";
      options.day = "numeric";
      break;
    case "time":
      options.hour = "numeric";
      options.minute = "2-digit";
      options.hour12 = true;
      break;
    case "datetime":
      options.month = "short";
      options.day = "numeric";
      options.hour = "numeric";
      options.minute = "2-digit";
      options.hour12 = true;
      break;
  }

  return date.toLocaleDateString("en-US", options);
};

export const formatTime = (date: Date, includeSeconds = false): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  if (includeSeconds) {
    options.second = "2-digit";
  }

  return date.toLocaleTimeString("en-US", options);
};

export const formatTimeRange = (startDate: Date, endDate: Date): string => {
  const startTime = formatTime(startDate);
  const endTime = formatTime(endDate);
  return `${startTime} - ${endTime}`;
};

// Date manipulation utilities
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

export const addMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is Sunday
  result.setDate(diff);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const startOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
};

// Date comparison utilities
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = addDays(new Date(), -1);
  return isSameDay(date, yesterday);
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = addDays(new Date(), 1);
  return isSameDay(date, tomorrow);
};

export const isThisWeek = (date: Date): boolean => {
  const start = startOfWeek(new Date());
  const end = endOfWeek(new Date());
  return date >= start && date <= end;
};

export const isThisMonth = (date: Date): boolean => {
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());
  return date >= start && date <= end;
};

// Timezone utilities
export const getLocalTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const convertToLocalTime = (date: Date): Date => {
  // For now, we'll assume the date is already in local time
  // In a real app, you might want to use a library like date-fns-tz
  return new Date(date);
};

export const convertToUTC = (date: Date): Date => {
  return new Date(date.toISOString());
};

// Duration utilities
export const getDurationInMinutes = (
  startDate: Date,
  endDate: Date
): number => {
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.round(diffMs / (1000 * 60));
};

export const getDurationInHours = (startDate: Date, endDate: Date): number => {
  const diffMs = endDate.getTime() - startDate.getTime();
  return diffMs / (1000 * 60 * 60);
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

// Calendar utilities
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const getCalendarDays = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Add days from previous month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(prevYear, prevMonth, daysInPrevMonth - i));
  }

  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  // Add days from next month to complete the grid
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remainingDays = 42 - days.length; // 6 rows * 7 days = 42

  for (let day = 1; day <= remainingDays; day++) {
    days.push(new Date(nextYear, nextMonth, day));
  }

  return days;
};

// Time picker utilities
export const getTimePickerMode = (): "spinner" | "default" => {
  return Platform.OS === "ios" ? "spinner" : "default";
};

export const getTimePickerDisplay = ():
  | "default"
  | "spinner"
  | "clock"
  | "calendar" => {
  return Platform.OS === "ios" ? "spinner" : "default";
};

// Event utilities
export const getEventColor = (eventType?: string): string => {
  const colors = {
    meeting: "#007AFF",
    appointment: "#34C759",
    reminder: "#FF9500",
    deadline: "#FF3B30",
    personal: "#AF52DE",
    work: "#5856D6",
    default: "#8E8E93",
  };

  return colors[eventType as keyof typeof colors] || colors.default;
};

export const getEventIcon = (eventType?: string): string => {
  const icons = {
    meeting: "👥",
    appointment: "📅",
    reminder: "⏰",
    deadline: "🎯",
    personal: "👤",
    work: "💼",
    default: "📋",
  };

  return icons[eventType as keyof typeof icons] || icons.default;
};

// Validation utilities
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const isDateInPast = (date: Date): boolean => {
  return date < new Date();
};

export const isDateInFuture = (date: Date): boolean => {
  return date > new Date();
};

export const hasTimeConflict = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  return start1 < end2 && start2 < end1;
};

// Export all utilities
export default {
  formatDate,
  formatTime,
  formatTimeRange,
  addDays,
  addHours,
  addMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isToday,
  isYesterday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  getLocalTimezone,
  convertToLocalTime,
  convertToUTC,
  getDurationInMinutes,
  getDurationInHours,
  formatDuration,
  getDaysInMonth,
  getFirstDayOfMonth,
  getCalendarDays,
  getTimePickerMode,
  getTimePickerDisplay,
  getEventColor,
  getEventIcon,
  isValidDate,
  isDateInPast,
  isDateInFuture,
  hasTimeConflict,
};
