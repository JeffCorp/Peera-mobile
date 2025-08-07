import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Provider } from 'react-redux';
import { AuthProvider } from './src/contexts/AuthContext';
import { useNotifications } from './src/hooks/useNotifications';
import RootNavigator from './src/navigation/RootNavigator';
import { store } from './src/store';

// App Content Component with notifications
function AppContent() {
  // Initialize notifications
  useNotifications();

  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
}

// Main App Component
export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Provider>
  );
} 