import { generateStylistResponse } from './aiService';

const SESSION_KEY = 'nova_chat_history';

export const DEFAULT_WELCOME = {
  id: 'welcome',
  sender: 'stylist',
  text: "Hi there! I'm Nova, your AI shopping assistant. I can help you find the perfect outfit, check what's in stock, or answer questions about shipping and returns. What are you looking for today?",
  recommendedProducts: [],
  timestamp: new Date().toISOString(),
};

export const STARTER_PROMPTS = [
  'Show me new arrivals',
  "What's on sale?",
  'Help me find a jacket',
  'Shipping & return info',
];

export const loadChatHistory = () => {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : [DEFAULT_WELCOME];
  } catch {
    return [DEFAULT_WELCOME];
  }
};

export const saveChatHistory = (history) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save chat history:', e);
  }
};

export const clearChatHistory = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const sendMessageToStylist = async (
  messageText,
  currentHistory,
  productsList = [],
  settings = null,
) => {
  if (!messageText.trim()) return { history: currentHistory, promise: Promise.resolve(currentHistory) };

  const userMsg = {
    id: `user-${Date.now()}`,
    sender: 'user',
    text: messageText,
    timestamp: new Date().toISOString(),
  };

  const updatedHistory = [...currentHistory, userMsg];
  saveChatHistory(updatedHistory);

  return {
    history: updatedHistory,
    promise: (async () => {
      try {
        // Pass full conversation history so Gemini has context memory
        const aiResponse = await generateStylistResponse(
          messageText,
          updatedHistory,
          productsList,
          settings,
        );

        const stylistMsg = {
          id: `stylist-${Date.now()}`,
          sender: 'stylist',
          text: aiResponse.text,
          recommendedProducts: aiResponse.recommendedProducts || [],
          timestamp: new Date().toISOString(),
        };

        const finalHistory = [...updatedHistory, stylistMsg];
        saveChatHistory(finalHistory);
        return finalHistory;
      } catch (err) {
        const errMsg = {
          id: `error-${Date.now()}`,
          sender: 'stylist',
          text: "I'm having a little trouble connecting right now. Please try again in a moment, or feel free to browse our products!",
          recommendedProducts: [],
          timestamp: new Date().toISOString(),
        };
        const finalHistory = [...updatedHistory, errMsg];
        saveChatHistory(finalHistory);
        return finalHistory;
      }
    })(),
  };
};
