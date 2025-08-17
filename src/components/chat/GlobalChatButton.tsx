import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useChat } from '../../contexts/ChatContext';

interface GlobalChatButtonProps {
  style?: ViewStyle;
  size?: number;
  iconSize?: number;
}

const GlobalChatButton: React.FC<GlobalChatButtonProps> = ({
  style,
  size = 56,
  iconSize = 24
}) => {
  const { showChat } = useChat();

  const buttonStyle = [
    styles.button,
    { width: size, height: size, borderRadius: size / 2 },
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={showChat}
      activeOpacity={0.8}
    >
      <Ionicons
        name="chatbubble-ellipses"
        size={iconSize}
        color="#FFFFFF"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
});

export default GlobalChatButton;
