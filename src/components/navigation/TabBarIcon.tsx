import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TabBarIconProps } from '../../types/navigation';

interface IconProps extends TabBarIconProps {
  name: string;
}

const TabBarIcon: React.FC<IconProps> = ({ focused, color, size, name }) => {
  const getIconName = () => {
    switch (name) {
      case 'home':
        return focused ? 'home' : 'home-outline';
      case 'calendar':
        return focused ? 'calendar' : 'calendar-outline';
      case 'voice':
        return focused ? 'mic' : 'mic-outline';
      case 'expenses':
        return focused ? 'card' : 'card-outline';
      case 'profile':
        return focused ? 'person' : 'person-outline';
      default:
        return focused ? 'home' : 'home-outline';
    }
  };

  const getIconBackground = () => {
    if (!focused) return 'transparent';

    switch (name) {
      case 'home':
        return 'rgba(99, 102, 241, 0.2)';
      case 'calendar':
        return 'rgba(139, 92, 246, 0.2)';
      case 'voice':
        return 'rgba(236, 72, 153, 0.2)';
      case 'expenses':
        return 'rgba(16, 185, 129, 0.2)';
      case 'profile':
        return 'rgba(245, 158, 11, 0.2)';
      default:
        return 'rgba(99, 102, 241, 0.2)';
    }
  };

  const getIconBorder = () => {
    if (!focused) return 'transparent';

    switch (name) {
      case 'home':
        return 'rgba(99, 102, 241, 0.4)';
      case 'calendar':
        return 'rgba(139, 92, 246, 0.4)';
      case 'voice':
        return 'rgba(236, 72, 153, 0.4)';
      case 'expenses':
        return 'rgba(16, 185, 129, 0.4)';
      case 'profile':
        return 'rgba(245, 158, 11, 0.4)';
      default:
        return 'rgba(99, 102, 241, 0.4)';
    }
  };

  return (
    <View style={[
      styles.iconContainer,
      {
        width: size + 16,
        height: size + 16,
        backgroundColor: getIconBackground(),
        borderColor: getIconBorder(),
      }
    ]}>
      <View style={[styles.icon, { width: size, height: size }]}>
        <Ionicons
          name={getIconName() as any}
          size={size * 0.6}
          color={focused ? color : '#9CA3AF'}
          style={{
            textShadowColor: focused ? color : 'transparent',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: focused ? 8 : 0,
          }}
        />
      </View>
      {/* {focused && (
        <View style={[
          styles.activeIndicator,
          { backgroundColor: color }
        ]} />
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default TabBarIcon; 