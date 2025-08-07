import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import TabBarIcon from '../components/navigation/TabBarIcon';
import { MainTabParamList } from '../types/navigation';

// Import screens (we'll create these next)
import { CalendarScreen } from '../screens/main/CalendarScreen';
import ExpensesScreen from '../screens/main/ExpensesScreen';
import HomeScreen from '../screens/main/HomeScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import VoiceScreen from '../screens/main/VoiceScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Calendar':
              iconName = 'calendar';
              break;
            case 'Voice':
              iconName = 'voice';
              break;
            case 'Expenses':
              iconName = 'expenses';
              break;
            case 'Profile':
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
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 90,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
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
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
        }}
      />
      <Tab.Screen
        name="Voice"
        component={VoiceScreen}
        options={{
          tabBarLabel: 'Voice',
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          tabBarLabel: 'Expenses',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator; 