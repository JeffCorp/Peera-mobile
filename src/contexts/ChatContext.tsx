import React, { createContext, ReactNode, useContext, useState } from 'react';

interface ChatContextType {
  isChatVisible: boolean;
  showChat: () => void;
  hideChat: () => void;
  toggleChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  console.log('ChatProvider rendering, isChatVisible:', isChatVisible);

  const showChat = () => {
    console.log('showChat called, setting isChatVisible to true');
    setIsChatVisible(true);
  };
  const hideChat = () => {
    console.log('hideChat called, setting isChatVisible to false');
    setIsChatVisible(false);
  };
  const toggleChat = () => {
    console.log('toggleChat called, current value:', isChatVisible);
    setIsChatVisible(prev => !prev);
  };

  const value: ChatContextType = {
    isChatVisible,
    showChat,
    hideChat,
    toggleChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
