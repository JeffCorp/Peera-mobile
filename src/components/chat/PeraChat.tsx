import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'expense' | 'suggestion';
}

interface PeraChatProps {
  onClose: () => void;
  onAddExpense?: (expenseData: any) => void;
  onAddPlannedExpense?: (expenseData: any) => void;
}

const PeraChat: React.FC<PeraChatProps> = ({ onClose, onAddExpense, onAddPlannedExpense }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm Pera, your AI financial assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestions = [
    "Add an expense",
    "Show my spending summary",
    "Help me budget",
    "Analyze my expenses",
    "Plan future expenses",
  ];

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        type: aiResponse.type,
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateAIResponse = (userInput: string) => {
    const input = userInput.toLowerCase();

    if (input.includes('expense') || input.includes('spend') || input.includes('cost')) {
      return {
        text: "I can help you add an expense! What was the amount and what was it for?",
        type: 'suggestion' as const,
      };
    }

    if (input.includes('budget') || input.includes('save') || input.includes('money')) {
      return {
        text: "Great! Let's work on your budget. I can help you track spending and set financial goals. What would you like to focus on?",
        type: 'text' as const,
      };
    }

    if (input.includes('summary') || input.includes('overview') || input.includes('report')) {
      return {
        text: "I can show you a spending summary! Would you like to see your expenses by category, monthly totals, or overall spending patterns?",
        type: 'text' as const,
      };
    }

    if (input.includes('plan') || input.includes('future') || input.includes('upcoming')) {
      return {
        text: "Planning ahead is smart! I can help you set up planned expenses for future purchases. What are you planning to buy?",
        type: 'suggestion' as const,
      };
    }

    return {
      text: "I'm here to help with your finances! You can ask me to add expenses, show spending summaries, help with budgeting, or plan future expenses. What would you like to do?",
      type: 'text' as const,
    };
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Add an expense':
        if (onAddExpense) {
          onAddExpense({});
        }
        break;
      case 'Show my spending summary':
        // Navigate to stats or show summary
        break;
      case 'Help me budget':
        // Show budgeting interface
        break;
      case 'Analyze my expenses':
        // Show analysis
        break;
      case 'Plan future expenses':
        if (onAddPlannedExpense) {
          onAddPlannedExpense({});
        }
        break;
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>🤖</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Pera AI Assistant</Text>
            <Text style={styles.subtitle}>Your financial companion</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
            ]}
          >
            <View style={[
              styles.messageBubble,
              message.isUser ? styles.userMessageBubble : styles.aiMessageBubble,
            ]}>
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.aiMessageText,
              ]}>
                {message.text}
              </Text>
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessageContainer]}>
            <View style={[styles.messageBubble, styles.aiMessageBubble]}>
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>Pera is typing</Text>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Suggestions */}
      <View style={styles.suggestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => handleQuickAction(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask Pera anything about your finances..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? "#FFFFFF" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  closeButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessageBubble: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
  },
  aiMessageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 1,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionChip: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  suggestionText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default PeraChat;
