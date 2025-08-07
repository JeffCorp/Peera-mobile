# React Navigation Setup Guide

## Overview

This guide covers the complete React Navigation setup for the Executive AI Assistant app, including tab navigation, stack navigation, authentication flow, and proper TypeScript integration.

## 📋 Prerequisites

1. **React Navigation Dependencies**: Already installed

   - `@react-navigation/native`
   - `@react-navigation/bottom-tabs`
   - `@react-navigation/stack`
   - `@react-navigation/native-stack`
   - `react-native-screens`
   - `react-native-safe-area-context`

2. **TypeScript Configuration**: Properly configured with navigation types

## 🏗️ Navigation Structure

### **Root Navigation Hierarchy**

```
RootNavigator (NavigationContainer)
├── Auth Stack (when not authenticated)
│   ├── Login Screen
│   ├── Register Screen
│   └── Forgot Password Screen
└── Main Tab Navigator (when authenticated)
    ├── Home Tab
    ├── Calendar Tab
    ├── Voice Tab
    ├── Expenses Tab
    └── Profile Tab
```

### **TypeScript Navigation Types**

#### **Root Stack Types**

```typescript
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Loading: undefined;
};
```

#### **Auth Stack Types**

```typescript
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};
```

#### **Main Tab Types**

```typescript
export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Voice: undefined;
  Expenses: undefined;
  Profile: undefined;
};
```

## 🎨 Tab Bar Styling

### **Custom Tab Bar Icons**

- **SVG Icons**: Custom TabBarIcon component with SVG icons
- **Dynamic Styling**: Icons change appearance based on focus state
- **Consistent Design**: Matches app's design system

### **Tab Bar Configuration**

```typescript
tabBarActiveTintColor: '#007AFF',
tabBarInactiveTintColor: '#8E8E93',
tabBarStyle: {
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E5E5EA',
  paddingBottom: 5,
  paddingTop: 5,
  height: 85,
},
tabBarLabelStyle: {
  fontSize: 12,
  fontWeight: '500',
  marginTop: 4,
},
```

## 🔐 Authentication Flow Integration

### **Protected Routes**

- **Automatic Redirects**: Users are automatically redirected based on authentication status
- **Loading States**: Proper loading screens during authentication checks
- **Persistent Login**: Users stay logged in across app restarts

### **Navigation Guards**

```typescript
const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {user ? (
          // Show main app for authenticated users
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          // Show auth screens for unauthenticated users
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
```

## 📱 Screen Components

### **Main Tab Screens**

#### **1. HomeScreen**

- **Dashboard Overview**: Quick access to all app features
- **User Welcome**: Personalized greeting with user name
- **Quick Actions**: Direct navigation to other tabs
- **Recent Activity**: Display recent app activity

#### **2. CalendarScreen**

- **Today's Events**: Show current day's scheduled events
- **Upcoming Events**: Display future events
- **Add Event**: Quick access to create new events
- **Event Management**: View and manage existing events

#### **3. VoiceScreen**

- **Voice Commands**: Display available voice commands
- **Recording Controls**: Start/stop voice recording
- **Live Assistant**: Real-time voice recognition
- **Command History**: Recent voice commands

#### **4. ExpensesScreen**

- **Expense Summary**: Total expenses for current period
- **Recent Expenses**: List of recent expense entries
- **Quick Actions**: Add expense, view categories, analytics
- **Expense Management**: View and manage expense details

#### **5. ProfileScreen**

- **User Profile**: Display user information and avatar
- **Account Settings**: Edit profile, change password, privacy
- **Support & Info**: Help, support, and app information
- **Statistics**: User activity statistics

## 🎯 Navigation Features

### **Type-Safe Navigation**

```typescript
// Properly typed navigation
const navigation = useNavigation<NavigationProp<MainTabParamList>>();

// Type-safe navigation calls
navigation.navigate("Calendar");
navigation.navigate("Expenses");
```

### **Screen Transitions**

- **Slide Animations**: Smooth transitions between screens
- **Custom Transitions**: Configurable animation types
- **Gesture Support**: Swipe gestures for navigation

### **Deep Linking Support**

```typescript
// Deep link configuration
const linking = {
  prefixes: ["yourapp://", "https://yourapp.com"],
  config: {
    screens: {
      Main: {
        screens: {
          Home: "home",
          Calendar: "calendar",
          Voice: "voice",
          Expenses: "expenses",
          Profile: "profile",
        },
      },
      Auth: {
        screens: {
          Login: "login",
          Register: "register",
          ForgotPassword: "forgot-password",
        },
      },
    },
  },
};
```

## 🔧 Configuration

### **Navigation Container Setup**

```typescript
<NavigationContainer linking={linking}>
  <RootNavigator />
</NavigationContainer>
```

### **Screen Options**

```typescript
// Global screen options
screenOptions={{
  headerShown: false,
  animation: 'slide_from_right',
  gestureEnabled: true,
  gestureDirection: 'horizontal',
}}
```

### **Tab Bar Options**

```typescript
// Tab-specific options
tabBarIcon: ({ focused, color, size }) => (
  <TabBarIcon
    name={iconName}
    focused={focused}
    color={color}
    size={size}
  />
),
```

## 📊 Navigation State Management

### **Route Parameters**

```typescript
// Type-safe route parameters
type EventDetailsParams = {
  eventId: string;
};

// Navigation with parameters
navigation.navigate("EventDetails", { eventId: "123" });
```

### **Navigation Events**

```typescript
// Listen to navigation events
useFocusEffect(
  React.useCallback(() => {
    // Screen focused
    return () => {
      // Screen unfocused
    };
  }, [])
);
```

## 🎨 Custom Components

### **TabBarIcon Component**

- **SVG Icons**: Custom SVG icons for each tab
- **Focus States**: Different styling for active/inactive states
- **Consistent Design**: Matches app's design system

### **LoadingScreen Component**

- **Loading States**: Displayed during authentication checks
- **Customizable**: Configurable loading messages
- **Consistent UX**: Provides feedback during app initialization

## 🚀 Usage Examples

### **Basic Navigation**

```typescript
import { useNavigation } from "@react-navigation/native";

const MyComponent = () => {
  const navigation = useNavigation();

  const handleNavigate = () => {
    navigation.navigate("Calendar");
  };

  return <Button title="Go to Calendar" onPress={handleNavigate} />;
};
```

### **Navigation with Parameters**

```typescript
const handleViewEvent = (eventId: string) => {
  navigation.navigate("EventDetails", { eventId });
};
```

### **Authentication Navigation**

```typescript
const { user, logout } = useAuth();

const handleLogout = async () => {
  const result = await logout();
  if (result.success) {
    // Navigation will be handled automatically by RootNavigator
    console.log("Logged out successfully");
  }
};
```

## 🔒 Security Features

### **Route Protection**

- **Authentication Guards**: Automatic route protection
- **Loading States**: Proper loading during auth checks
- **Error Handling**: Graceful error handling for auth failures

### **Session Management**

- **Persistent Sessions**: Users stay logged in
- **Automatic Logout**: Session expiration handling
- **Secure Storage**: Encrypted token storage

## 📱 Platform Considerations

### **iOS Specific**

- **Safe Area**: Proper safe area handling
- **Gesture Navigation**: Native iOS gesture support
- **Status Bar**: Proper status bar integration

### **Android Specific**

- **Back Button**: Proper back button handling
- **Hardware Keys**: Navigation hardware key support
- **Material Design**: Android-specific styling

## 🧪 Testing

### **Navigation Testing**

```typescript
// Test navigation calls
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
};

// Test navigation with parameters
expect(mockNavigation.navigate).toHaveBeenCalledWith("Calendar");
```

### **Screen Testing**

```typescript
// Test screen rendering
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

const renderWithNavigation = (component: React.ReactElement) => {
  return render(<NavigationContainer>{component}</NavigationContainer>);
};
```

## 🚨 Troubleshooting

### **Common Issues**

1. **TypeScript Errors**:

   - Ensure navigation types are properly imported
   - Check that screen names match type definitions
   - Verify parameter types for navigation calls

2. **Navigation Not Working**:

   - Check that NavigationContainer wraps the entire app
   - Verify that screens are properly registered
   - Ensure authentication state is properly managed

3. **Tab Bar Issues**:
   - Check tab bar icon component implementation
   - Verify tab bar styling configuration
   - Ensure proper screen component exports

### **Debug Tips**

```typescript
// Enable navigation debugging
import { enableScreens } from "react-native-screens";
enableScreens();

// Log navigation state
navigation.addListener("state", (e) => {
  console.log("Navigation state:", e.data.state);
});
```

## 📚 Additional Resources

- [React Navigation Documentation](https://reactnavigation.org/)
- [TypeScript with React Navigation](https://reactnavigation.org/docs/typescript/)
- [Tab Navigation Guide](https://reactnavigation.org/docs/tab-based-navigation)
- [Stack Navigation Guide](https://reactnavigation.org/docs/stack-navigator)
- [Authentication Flow](https://reactnavigation.org/docs/auth-flow)

## 🎯 Best Practices

1. **Type Safety**: Always use TypeScript for navigation
2. **Consistent Naming**: Use consistent screen and parameter naming
3. **Error Handling**: Implement proper error handling for navigation
4. **Performance**: Optimize navigation performance with proper screen configuration
5. **Accessibility**: Ensure navigation is accessible to all users
6. **Testing**: Write comprehensive tests for navigation flows
7. **Documentation**: Document complex navigation patterns
8. **Code Organization**: Keep navigation logic organized and maintainable
