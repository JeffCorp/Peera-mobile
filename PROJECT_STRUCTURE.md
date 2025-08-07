# Executive AI Assistant - Project Structure

## Overview

This document outlines the organized folder structure and architecture for the Executive AI Assistant React Native app built with Expo Router and TypeScript.

## 📁 Root Directory Structure

```
Pera/
├── app/                    # Expo Router app directory
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Home screen
│   └── (tabs)/            # Tab navigation screens
│       ├── _layout.tsx    # Tab layout
│       └── explore.tsx    # Explore screen
├── src/                   # Source code directory
│   ├── components/        # Reusable UI components
│   ├── screens/          # Screen components
│   ├── services/         # API and business logic services
│   ├── utils/            # Utility functions and helpers
│   ├── types/            # TypeScript type definitions
│   ├── constants/        # App constants and configuration
│   ├── hooks/            # Custom React hooks
│   ├── assets/           # Static assets (images, fonts)
│   └── styles/           # Global styles and theming
├── assets/               # Expo assets (icons, splash screens)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # Project documentation
```

## 📁 Detailed Source Structure

### `/src/components/` - Reusable UI Components

```
components/
├── ui/                   # Basic UI components
│   ├── Button.tsx       # Reusable button component
│   ├── Input.tsx        # Form input component
│   ├── Card.tsx         # Card container component
│   └── index.ts         # Component exports
├── forms/               # Form-specific components
│   ├── LoginForm.tsx    # Login form component
│   ├── RegisterForm.tsx # Registration form component
│   └── index.ts         # Form component exports
└── layout/              # Layout components
    ├── Header.tsx       # App header component
    ├── Footer.tsx       # App footer component
    └── index.ts         # Layout component exports
```

**Purpose**: Contains all reusable UI components organized by functionality. UI components are the most basic, forms are for specific form implementations, and layout components handle app structure.

### `/src/screens/` - Screen Components

```
screens/
├── auth/                # Authentication screens
│   ├── LoginScreen.tsx  # Login screen
│   ├── RegisterScreen.tsx # Registration screen
│   └── index.ts         # Auth screen exports
├── main/                # Main app screens
│   ├── HomeScreen.tsx   # Home screen
│   ├── ChatScreen.tsx   # Chat interface screen
│   └── index.ts         # Main screen exports
└── settings/            # Settings screens
    ├── ProfileScreen.tsx # User profile screen
    ├── SettingsScreen.tsx # App settings screen
    └── index.ts         # Settings screen exports
```

**Purpose**: Contains screen-level components that represent full pages in the app. Organized by feature area for easy navigation and maintenance.

### `/src/services/` - Business Logic and API Services

```
services/
├── api.ts              # Main API service with axios
├── storage.ts          # AsyncStorage wrapper service
├── auth.ts             # Authentication service
└── index.ts            # Service exports
```

**Purpose**: Contains all business logic, API calls, and external service integrations. Services handle data fetching, storage, and complex business operations.

### `/src/utils/` - Utility Functions

```
utils/
├── helpers.ts          # General helper functions
├── validation.ts       # Form validation utilities
├── formatting.ts       # Data formatting utilities
└── index.ts           # Utility exports
```

**Purpose**: Contains pure utility functions for common operations like date formatting, string manipulation, validation, and other helper functions.

### `/src/types/` - TypeScript Type Definitions

```
types/
├── index.ts            # Main type definitions
├── api.ts              # API-related types
├── navigation.ts       # Navigation types
└── components.ts       # Component prop types
```

**Purpose**: Centralized location for all TypeScript interfaces, types, and type definitions. Ensures type safety across the application.

### `/src/constants/` - App Constants

```
constants/
├── index.ts            # Main constants file
├── colors.ts           # Color definitions
├── api.ts              # API endpoints and config
└── validation.ts       # Validation rules
```

**Purpose**: Contains all app-wide constants, configuration values, API endpoints, and other static data that shouldn't be hardcoded in components.

### `/src/hooks/` - Custom React Hooks

```
hooks/
├── useTheme.ts         # Theme management hook
├── useAuth.ts          # Authentication hook
├── useApi.ts           # API data fetching hook
└── index.ts            # Hook exports
```

**Purpose**: Custom React hooks that encapsulate reusable stateful logic and side effects. Hooks provide clean abstractions for complex functionality.

### `/src/assets/` - Static Assets

```
assets/
├── images/             # Image assets
├── icons/              # Icon assets
├── fonts/              # Custom fonts
└── index.ts            # Asset exports
```

**Purpose**: Contains all static assets like images, icons, and fonts. Assets are organized by type for easy management.

### `/src/styles/` - Global Styles and Theming

```
styles/
├── theme.ts            # Theme definitions
├── globalStyles.ts     # Global style utilities
├── typography.ts       # Typography styles
└── index.ts            # Style exports
```

**Purpose**: Contains theme definitions, global styles, and styling utilities. Ensures consistent design across the application.

## 🎨 Styling Approach

### Theme System

- **Light/Dark Themes**: Support for both light and dark themes with system preference detection
- **Consistent Colors**: Centralized color palette with semantic naming
- **Typography Scale**: Consistent font sizes and weights
- **Spacing System**: Standardized spacing values for consistent layouts

### Component Styling

- **Styled Components**: Using React Native StyleSheet for performance
- **Theme Integration**: Components receive theme context for dynamic styling
- **Responsive Design**: Flexible layouts that adapt to different screen sizes

## 🔧 TypeScript Configuration

### Path Mapping

The `tsconfig.json` includes path aliases for clean imports:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/components/*"],
    "@/screens/*": ["./src/screens/*"],
    "@/services/*": ["./src/services/*"],
    "@/utils/*": ["./src/utils/*"],
    "@/types/*": ["./src/types/*"],
    "@/constants/*": ["./src/constants/*"],
    "@/hooks/*": ["./src/hooks/*"],
    "@/assets/*": ["./src/assets/*"],
    "@/styles/*": ["./src/styles/*"]
  }
}
```

### Strict Type Checking

- `strict: true` - Enables all strict type checking options
- `noImplicitAny: true` - Prevents implicit any types
- `noImplicitReturns: true` - Ensures all code paths return a value
- `exactOptionalPropertyTypes: true` - Strict optional property handling

## 🧭 Navigation Structure

### Expo Router Setup

- **File-based Routing**: Uses Expo Router for intuitive file-based navigation
- **Stack Navigation**: Main navigation with header customization
- **Tab Navigation**: Bottom tab navigation for main app sections
- **Type Safety**: Navigation types ensure route parameter safety

### Navigation Flow

```
Root Layout (_layout.tsx)
├── Home Screen (index.tsx)
└── Tab Navigation ((tabs)/_layout.tsx)
    ├── Home Tab
    ├── Chat Tab
    ├── Explore Tab
    └── Settings Tab
```

## 📦 Key Dependencies

### Core Dependencies

- **Expo Router**: File-based navigation
- **React Navigation**: Navigation primitives
- **Axios**: HTTP client for API calls
- **AsyncStorage**: Local data persistence

### Development Dependencies

- **TypeScript**: Type safety and development experience
- **ESLint**: Code linting and formatting
- **Expo**: Development platform and tools

## 🚀 Best Practices

### Code Organization

1. **Feature-based Structure**: Organize code by features rather than types
2. **Consistent Naming**: Use consistent naming conventions across the project
3. **Separation of Concerns**: Keep business logic separate from UI components
4. **Type Safety**: Use TypeScript interfaces for all data structures

### Component Guidelines

1. **Single Responsibility**: Each component should have one clear purpose
2. **Reusability**: Design components to be reusable across the app
3. **Props Interface**: Always define TypeScript interfaces for component props
4. **Error Boundaries**: Implement error boundaries for robust error handling

### State Management

1. **Local State**: Use React hooks for component-level state
2. **Context API**: Use React Context for theme and authentication state
3. **Async Storage**: Persist important data locally
4. **API State**: Handle loading, error, and success states consistently

### Performance

1. **Memoization**: Use React.memo and useMemo for expensive operations
2. **Lazy Loading**: Implement lazy loading for screens and components
3. **Image Optimization**: Optimize images and use appropriate formats
4. **Bundle Size**: Monitor and optimize bundle size

## 🔄 Development Workflow

### Adding New Features

1. **Create Types**: Define TypeScript interfaces in `/src/types/`
2. **Add Constants**: Add any constants to `/src/constants/`
3. **Create Services**: Implement business logic in `/src/services/`
4. **Build Components**: Create reusable components in `/src/components/`
5. **Add Screens**: Create screen components in `/src/screens/`
6. **Update Navigation**: Add routes to the navigation structure
7. **Test**: Write tests for new functionality

### File Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useTheme.ts`, `useAuth.ts`)
- **Services**: camelCase (e.g., `apiService.ts`, `storageService.ts`)
- **Types**: camelCase (e.g., `userTypes.ts`, `apiTypes.ts`)
- **Constants**: UPPER_SNAKE_CASE for values, camelCase for files

This structure provides a solid foundation for building a scalable, maintainable, and type-safe React Native application with excellent developer experience.
