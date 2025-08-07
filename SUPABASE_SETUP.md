# Supabase Integration Setup Guide

## Overview

This guide will help you set up Supabase integration for your Executive AI Assistant React Native app.

## 📋 Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **React Native Project**: Your existing Expo project
3. **Node.js**: Version 16 or higher

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js react-native-url-polyfill
```

### 2. Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
EXPO_PUBLIC_APP_NAME=Executive AI Assistant
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 3. Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Navigate to **Settings > API**
4. Copy the **Project URL** and **anon/public key**

## 🗄️ Database Schema

### Create Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Events policies
CREATE POLICY "Users can view own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON public.events
  FOR DELETE USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔧 Configuration

### Update Supabase Client

The Supabase client is already configured in `src/services/supabase.ts`. Make sure your environment variables are set correctly.

### Authentication Setup

1. **Enable Email Auth** in Supabase:

   - Go to **Authentication > Settings**
   - Enable "Enable email confirmations" if needed
   - Configure email templates

2. **Set up Redirect URLs**:
   - Go to **Authentication > URL Configuration**
   - Add your app's redirect URLs:
     - `yourapp://login-callback`
     - `yourapp://reset-password`

## 📱 Usage Examples

### Authentication

```typescript
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, login, register, logout, loading, error } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      email: 'user@example.com',
      password: 'password123'
    });

    if (result.success) {
      console.log('Login successful');
    } else {
      console.error('Login failed:', result.error);
    }
  };

  return (
    // Your component JSX
  );
};
```

### Data Operations

```typescript
import { dataService } from "@/services/data";

// Create an event
const createEvent = async () => {
  const result = await dataService.createEvent({
    title: "Team Meeting",
    description: "Weekly team sync",
    start_date: "2024-01-15T10:00:00Z",
    user_id: user.id,
  });

  if (result.success) {
    console.log("Event created:", result.data);
  }
};

// Get expenses
const getExpenses = async () => {
  const result = await dataService.getExpenses(user.id);

  if (result.success) {
    console.log("Expenses:", result.data);
  }
};
```

## 🔒 Security Best Practices

1. **Row Level Security (RLS)**: All tables have RLS enabled with appropriate policies
2. **Environment Variables**: Never commit API keys to version control
3. **Input Validation**: Always validate user input before database operations
4. **Error Handling**: Use the provided error handling patterns

## 🚨 Error Handling

The services include comprehensive error handling:

```typescript
// All service methods return a consistent result format
interface DataResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Example usage
const result = await dataService.createEvent(eventData);
if (result.success) {
  // Handle success
  console.log(result.data);
} else {
  // Handle error
  console.error(result.error);
}
```

## 🔄 Real-time Features

Supabase supports real-time subscriptions:

```typescript
import { supabase } from "@/services/supabase";

// Subscribe to expense changes
const subscription = supabase
  .channel("expenses")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "expenses" },
    (payload) => {
      console.log("Expense changed:", payload);
    }
  )
  .subscribe();
```

## 📊 Analytics

The data service includes analytics functions:

```typescript
// Get expense analytics
const analytics = await dataService.getExpenseAnalytics(
  user.id,
  "2024-01-01",
  "2024-12-31"
);

if (analytics.success) {
  console.log("Total amount:", analytics.data.totalAmount);
  console.log("Category totals:", analytics.data.categoryTotals);
}
```

## 🧪 Testing

### Environment Variables for Testing

Create a `.env.test` file for testing:

```env
EXPO_PUBLIC_SUPABASE_URL=your_test_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_test_anon_key
```

### Mock Services

For testing, you can create mock versions of the services:

```typescript
// src/services/__mocks__/auth.ts
export const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  // ... other methods
};
```

## 🚀 Deployment

1. **Environment Variables**: Ensure all environment variables are set in your deployment platform
2. **Database Migrations**: Run the SQL schema in your production Supabase project
3. **Security Rules**: Verify RLS policies are correctly configured
4. **Monitoring**: Set up error monitoring for production

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Native with Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## 🆘 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**:

   - Restart your development server
   - Check that variables start with `EXPO_PUBLIC_`
   - Verify the `.env` file is in the project root

2. **Authentication Errors**:

   - Check Supabase project settings
   - Verify redirect URLs are configured
   - Ensure email confirmations are properly set up

3. **Database Permission Errors**:

   - Verify RLS policies are enabled
   - Check that policies match your use case
   - Ensure user is authenticated

4. **TypeScript Errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Check that types are properly imported
   - Verify TypeScript configuration

### Getting Help

- Check the [Supabase Community](https://github.com/supabase/supabase/discussions)
- Review the [Supabase Status Page](https://status.supabase.com)
- Consult the [React Native documentation](https://reactnative.dev/docs/getting-started)
