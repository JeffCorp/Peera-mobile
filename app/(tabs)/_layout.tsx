import GlobalChatButton from '@/components/chat/GlobalChatButton';
import GlobalPeraChat from '@/components/chat/GlobalPeraChat';
import { ChatProvider } from '@/contexts/ChatContext';
import { Tabs } from 'expo-router';
import React from 'react';
import TabBarIcon from '../../src/components/navigation/TabBarIcon';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            switch (route.name) {
              case 'home':
                iconName = 'home';
                break;
              case 'calendar':
                iconName = 'calendar';
                break;
              case 'voice':
                iconName = 'voice';
                break;
              case 'chat':
                iconName = 'chatbubble-ellipses';
                break;
              case 'expenses':
                iconName = 'expenses';
                break;
              case 'profile':
                iconName = 'profile';
                break;
              default:
                iconName = 'home';
            }

            return (
              <TabBarIcon
                name={iconName}
                focused={focused}
                color={color}
                size={size}
              />
            );
          },
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderTopWidth: 0,
            paddingBottom: 8,
            paddingTop: 8,
            height: 90,
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            backdropFilter: 'blur(20px)',
            borderRadius: 25,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 6,
            letterSpacing: 0.5,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
          headerShown: false,
        })}
      >
        <Tabs.Screen
          name="home"
          options={{
            // title: 'Home',
            tabBarLabel: 'Home',
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            // title: 'Calendar',
            tabBarLabel: 'Calendar',
          }}
        />
        <Tabs.Screen
          name="voice"
          options={{
            // title: 'Voice',
            tabBarLabel: 'Voice',
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            // title: 'Chat',
            tabBarLabel: 'Chat',
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            // title: 'Expenses',
            tabBarLabel: 'Expenses',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            // title: 'Profile',
            tabBarLabel: 'Profile',
          }}
        />
      </Tabs>
      <ChatProvider>
        <GlobalChatButton />
        <GlobalPeraChat />
      </ChatProvider>

      {/* Global Chat Modal */}
      {/* <GlobalPeraChat /> */}
    </>
  );
}
