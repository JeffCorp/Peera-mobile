# Authentication Flow Setup

This document describes the complete authentication flow implementation for the React Native app that connects to a NestJS backend.

## Overview

The authentication system includes:

- Redux store setup for authentication state management
- Secure token storage using Expo SecureStore
- Auto-login functionality on app startup
- API service for authentication operations
- Auth screens with form validation
- Navigation guards and protected routes
- Error handling and user feedback

## Architecture

### 1. Redux Store (Auth Slice)

- **Location**: `src/store/slices/authSlice.ts`
- **Features**:
  - Login, register, logout actions
  - Auto-login functionality
  - Token refresh handling
  - Profile management
  - Loading and error states

### 2. Auth Service

- **Location**: `src/services/auth/authService.ts`
- **Features**:
  - API communication with NestJS backend
  - Token storage and retrieval
  - Automatic token refresh
  - User data management
  - Secure storage using Expo SecureStore

### 3. Auth Context

- **Location**: `src/contexts/AuthContext.tsx`
- **Features**:
  - Redux integration
  - Auto-login on app startup
  - Authentication state management
  - Error handling

### 4. Auth Screens

- **Login Screen**: `src/screens/auth/LoginScreen.tsx`
- **Register Screen**: `src/screens/auth/RegisterScreen.tsx`
- **Forgot Password Screen**: `src/screens/auth/ForgotPasswordScreen.tsx`

### 5. Navigation

- **Root Navigator**: `src/navigation/RootNavigator.tsx`
- **Protected Routes**: `src/components/auth/ProtectedRoute.tsx`
- **Conditional navigation based on auth state**

## API Endpoints

The authentication system expects the following NestJS backend endpoints:

```typescript
// Auth endpoints
POST / auth / login; // Login with email/password
POST / auth / register; // Register new user
POST / auth / refresh; // Refresh access token
POST / auth / logout; // Logout user

// User endpoints
GET / users / profile; // Get user profile
PUT / users / profile; // Update user profile
```

## Expected API Response Format

```typescript
// Success response
{
  success: true,
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
      createdAt: string;
      updatedAt: string;
    },
    tokens: {
      accessToken: string;
      refreshToken: string;
    }
  },
  message?: string;
}

// Error response
{
  success: false,
  message: string;
}
```

## Testing the Authentication Flow

### 1. Start the NestJS Backend

Make sure your NestJS backend is running on `http://localhost:3000` with the required endpoints implemented.

### 2. Run the React Native App

```bash
npm start
# or
expo start
```

### 3. Test Flow: Register → Login → Profile Access

#### Step 1: Register a New User

1. Open the app
2. Navigate to the Register screen
3. Fill in the form:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
4. Tap "Create Account"
5. Verify successful registration

#### Step 2: Login

1. Navigate to the Login screen
2. Enter credentials:
   - Email: "test@example.com"
   - Password: "password123"
3. Tap "Sign In"
4. Verify successful login and navigation to main app

#### Step 3: Access Profile

1. Navigate to the Profile tab
2. Verify user information is displayed correctly
3. Test logout functionality

### 4. Test Auto-Login

1. Close the app completely
2. Reopen the app
3. Verify automatic login and navigation to main app

### 5. Test Logout

1. Go to Profile screen
2. Tap "Logout"
3. Verify logout and navigation back to auth screens

## Configuration

### Environment Variables

Update `src/config/env.ts` with your backend configuration:

```typescript
export const ENV = {
  API_BASE_URL: "http://localhost:3000", // Your NestJS backend URL
  API_TIMEOUT: 10000,
  // ... other config
};
```

### API Endpoints

Update `src/config/env.ts` with your actual endpoints:

```typescript
export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh",
  LOGOUT: "/auth/logout",
  PROFILE: "/users/profile",
  UPDATE_PROFILE: "/users/profile",
  // ... other endpoints
};
```

## Security Features

### Token Storage

- Access tokens and refresh tokens are stored securely using Expo SecureStore
- Tokens are automatically refreshed when they expire
- Failed refresh attempts trigger logout

### Error Handling

- Network errors are handled gracefully
- Authentication errors are displayed to users
- Automatic retry mechanisms for failed requests

### Form Validation

- Email format validation
- Password strength requirements
- Real-time error feedback
- Input sanitization

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**

   - Ensure NestJS backend is running on the correct port
   - Check network connectivity
   - Verify API endpoints match backend implementation

2. **Token Refresh Issues**

   - Check refresh token endpoint implementation
   - Verify token storage permissions
   - Check token expiration handling

3. **Navigation Issues**
   - Verify auth state is properly managed
   - Check navigation guards implementation
   - Ensure proper screen registration

### Debug Tools

Use the test utilities in `src/utils/testAuth.ts` to debug authentication issues:

```typescript
import { testAuthFlow, testApiConnection } from "../utils/testAuth";

// Test the complete auth flow
await testAuthFlow();

// Test API connection
await testApiConnection();
```

## Next Steps

1. **Implement Password Reset**: Complete the forgot password functionality
2. **Add Social Login**: Integrate OAuth providers (Google, Apple, etc.)
3. **Profile Management**: Add profile editing capabilities
4. **Session Management**: Implement session timeout and security features
5. **Analytics**: Add authentication event tracking
6. **Testing**: Add unit and integration tests

## Dependencies

The authentication system uses the following key dependencies:

- `@reduxjs/toolkit`: State management
- `react-redux`: Redux integration
- `expo-secure-store`: Secure token storage
- `axios`: HTTP client for API calls
- `@react-navigation/native`: Navigation
- `react-native-safe-area-context`: Safe area handling

## Support

For issues or questions about the authentication implementation, refer to:

- React Native documentation
- Expo documentation
- Redux Toolkit documentation
- NestJS documentation
