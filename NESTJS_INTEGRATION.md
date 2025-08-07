# React Native App with NestJS Backend Integration

## Overview

This implementation provides a complete React Native app setup with TypeScript, Redux Toolkit, React Navigation, and full integration with a NestJS backend API.

## 🚀 Features Implemented

### 1. **Project Structure**

```
src/
├── api/           # API client and services
├── components/    # Reusable UI components
├── config/        # Environment configuration
├── screens/       # App screens
├── services/      # Business logic services
├── store/         # Redux store and slices
└── types/         # TypeScript interfaces
```

### 2. **Dependencies Installed**

- **Navigation**: `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`
- **State Management**: `@reduxjs/toolkit`, `react-redux`
- **API**: `axios` for HTTP requests
- **Security**: `expo-secure-store` for token storage
- **Calendar**: `react-native-calendars`
- **UI**: `react-native-screens`, `react-native-safe-area-context`

### 3. **API Client Configuration**

- **Base URL**: `http://localhost:3000` (NestJS backend)
- **JWT Token Management**: Automatic token refresh
- **Error Handling**: Comprehensive error handling for network requests
- **Request/Response Interceptors**: For authentication and error handling

### 4. **Redux Store Setup**

- **Auth Slice**: User authentication and profile management
- **Expense Slice**: Expense CRUD operations and filtering
- **Calendar Slice**: Calendar events management
- **Voice Slice**: Voice command processing

### 5. **Navigation Structure**

- **Stack Navigator**: Main app navigation with authentication flow
- **Tab Navigator**: Bottom tab navigation for main features
- **TypeScript Support**: Fully typed navigation parameters

## 📱 App Features

### **Authentication**

- Login/Register functionality
- JWT token management
- Automatic token refresh
- Secure token storage

### **Expense Management**

- Add/Edit/Delete expenses
- Category management
- Receipt capture
- Search and filtering
- Statistics and analytics

### **Calendar Integration**

- Event creation and management
- Date range selection
- Event linking with expenses

### **Voice Assistant**

- Voice command processing
- Audio transcription
- Recent commands history

## 🔧 Technical Implementation

### **Environment Configuration**

```typescript
// src/config/env.ts
export const ENV = {
  API_BASE_URL: "http://localhost:3000",
  API_TIMEOUT: 10000,
  NODE_ENV: "development",
  APP_NAME: "Pera",
  APP_VERSION: "1.0.0",
};
```

### **API Client Setup**

```typescript
// src/api/client.ts
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    this.setupInterceptors();
  }
}
```

### **Redux Store Configuration**

```typescript
// src/store/index.ts
export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expenseReducer,
    calendar: calendarReducer,
    voice: voiceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        ignoredPaths: ["items.dates"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});
```

### **Navigation Setup**

```typescript
// App.tsx
function MainTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={ExploreScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Voice" component={VoiceScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

## 🔌 API Integration

### **Authentication Endpoints**

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

### **User Endpoints**

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

### **Expense Endpoints**

- `GET /expenses` - Get expenses with filters
- `POST /expenses` - Create new expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense
- `GET /expenses/categories` - Get expense categories
- `GET /expenses/stats` - Get expense statistics

### **Calendar Endpoints**

- `GET /events` - Get calendar events
- `POST /events` - Create new event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### **Voice Endpoints**

- `POST /voice/process` - Process voice command
- `POST /voice/transcribe` - Transcribe audio
- `GET /voice/commands` - Get recent commands

## 🔐 Security Features

### **JWT Token Management**

- Automatic token refresh on 401 responses
- Secure token storage using `expo-secure-store`
- Token validation and cleanup

### **Request Interceptors**

```typescript
this.client.interceptors.request.use(async (config) => {
  const token = await this.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### **Response Interceptors**

```typescript
this.client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      const newToken = await this.refreshToken();
      if (newToken) {
        return this.client.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

## 📊 State Management

### **Auth State**

```typescript
interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### **Expense State**

```typescript
interface ExpenseState {
  expenses: Expense[];
  categories: ExpenseCategory[];
  stats: ExpenseStats | null;
  filters: ExpenseFilters;
  isLoading: boolean;
  error: string | null;
  selectedExpense: Expense | null;
}
```

### **Async Thunks**

```typescript
export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (filters: ExpenseFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/expenses", { params: filters });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
```

## 🎨 UI Components

### **Reusable Components**

- **Button**: Customizable button with variants
- **Input**: Form input with validation
- **Card**: Container component
- **Modal**: Modal dialog component

### **Screen Components**

- **AddExpenseScreen**: Expense creation form
- **ExpensesScreen**: Expense list with filtering
- **CalendarScreen**: Calendar view
- **VoiceScreen**: Voice assistant interface

## 🔄 Data Flow

### **API Request Flow**

1. **Component** dispatches async thunk
2. **Redux Toolkit** handles async operation
3. **API Client** makes HTTP request
4. **NestJS Backend** processes request
5. **Response** flows back through the chain
6. **State** is updated with new data

### **Authentication Flow**

1. **User** enters credentials
2. **Login thunk** sends request to backend
3. **Backend** validates and returns tokens
4. **Tokens** are stored securely
5. **User state** is updated
6. **Navigation** redirects to main app

## 🛠 Development Setup

### **Prerequisites**

- Node.js 16+ (recommended 18+)
- Expo CLI
- NestJS backend running on localhost:3000

### **Installation**

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### **Environment Configuration**

Create a `.env` file in the project root:

```env
API_BASE_URL=http://localhost:3000
API_TIMEOUT=10000
NODE_ENV=development
```

## 🧪 Testing

### **Unit Testing**

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

### **Integration Testing**

```bash
# Test API integration
npm run test:integration
```

## 📱 Production Deployment

### **Build Configuration**

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### **Environment Variables**

```env
API_BASE_URL=https://your-production-api.com
API_TIMEOUT=15000
NODE_ENV=production
```

## 🔧 Customization

### **Adding New Features**

1. **Create Redux slice** in `src/store/slices/`
2. **Add API endpoints** in `src/config/env.ts`
3. **Create API service** in `src/api/`
4. **Add navigation routes** in `App.tsx`
5. **Create UI components** in `src/components/`

### **Modifying API Configuration**

```typescript
// src/config/env.ts
export const ENV = {
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3000",
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT || "10000"),
  // Add more configuration as needed
};
```

## 🐛 Troubleshooting

### **Common Issues**

#### **Network Errors**

- Check if NestJS backend is running
- Verify API_BASE_URL in environment
- Check network connectivity

#### **Authentication Issues**

- Verify JWT token format
- Check token expiration
- Ensure secure storage is working

#### **Navigation Errors**

- Verify navigation types in `src/types/index.ts`
- Check screen component imports
- Ensure navigation parameters match

### **Debug Tools**

- **Redux DevTools**: Available in development
- **React Native Debugger**: For debugging
- **Expo DevTools**: For development

## 📚 Additional Resources

### **Documentation**

- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Expo](https://docs.expo.dev/)
- [NestJS](https://nestjs.com/)

### **Best Practices**

- Use TypeScript for type safety
- Implement proper error handling
- Follow Redux Toolkit patterns
- Use secure storage for sensitive data
- Implement proper loading states

## 🚀 Next Steps

### **Immediate Tasks**

1. **Create missing screens** (Profile, Settings, etc.)
2. **Implement real camera integration**
3. **Add offline support**
4. **Implement push notifications**

### **Future Enhancements**

1. **Real-time updates** with WebSockets
2. **Advanced analytics** and reporting
3. **Multi-language support**
4. **Dark mode** implementation
5. **Advanced voice features**

This setup provides a solid foundation for a React Native app with full NestJS backend integration, ready for development and production deployment.
