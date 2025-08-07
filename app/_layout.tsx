import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from 'react';
import { Provider } from 'react-redux';
import { AuthProvider } from "../src/contexts/AuthContext";
import { store } from "../src/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Executive AI Assistant',
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </AuthProvider>
    </Provider>
  );
}
