/**
 * Chatbot Service
 * 
 * Manages Chatbot conversation history logs, session storage persistence,
 * starter prompts, and triggers.
 */
import { generateStylistResponse } from './aiService';

const CHAT_SESSION_KEY = 'fomo_stylist_chat';

// Default welcome introduction block
export const DEFAULT_WELCOME = {
  id: 'welcome',
  sender: 'stylist',
  text: "Yo, I'm your FOMO AI Personal Stylist. Let's get your fit locked in. Ask me anything about our silhouettes, winter drops, minimal street layering, or what goes hard with your favorite cargos. If you know, you know.",
  recommendedProducts: [],
  timestamp: new Date().toISOString()
};

// Curated starter prompt questions
export const STARTER_PROMPTS = [
  "What's trending right now?",
  "Suggest a minimal clean fit",
  "What should I wear with a hoodie?",
  "Winter streetwear layers"
];

/**
 * Loads conversation logs from sessionStorage.
 */
export const loadChatHistory = () => {
  try {
    const history = sessionStorage.getItem(CHAT_SESSION_KEY);
    return history ? JSON.parse(history) : [DEFAULT_WELCOME];
  } catch (err) {
    console.warn("Failed to load chat history", err);
    return [DEFAULT_WELCOME];
  }
};

/**
 * Saves conversation logs to sessionStorage.
 */
export const saveChatHistory = (history) => {
  try {
    sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(history));
  } catch (err) {
    console.warn("Failed to save chat history", err);
  }
};

/**
 * Handles sending a message. Updates conversation history and streams the response.
 */
export const sendMessageToStylist = async (messageText, currentHistory, productsList = []) => {
  if (!messageText.trim()) return currentHistory;

  // 1. Append user message
  const userMsg = {
    id: `user-${Date.now()}`,
    sender: 'user',
    text: messageText,
    timestamp: new Date().toISOString()
  };
  
  const updatedHistory = [...currentHistory, userMsg];
  saveChatHistory(updatedHistory);

  // 2. Return with updated list so the UI shows the user bubble immediately
  return {
    history: updatedHistory,
    promise: (async () => {
      try {
        const aiResponse = await generateStylistResponse(messageText, productsList);
        
        const stylistMsg = {
          id: `stylist-${Date.now()}`,
          sender: 'stylist',
          text: aiResponse.text,
          recommendedProducts: aiResponse.recommendedProducts || [],
          timestamp: new Date().toISOString()
        };

        const finalHistory = [...updatedHistory, stylistMsg];
        saveChatHistory(finalHistory);
        return finalHistory;
      } catch (err) {
        // Safe UI error fallback
        const errMsg = {
          id: `error-${Date.now()}`,
          sender: 'stylist',
          text: "My styling feeds are running hot right now. Give me a second to clear the threads, or try asking again. Peace.",
          recommendedProducts: [],
          timestamp: new Date().toISOString()
        };
        const finalHistory = [...updatedHistory, errMsg];
        saveChatHistory(finalHistory);
        return finalHistory;
      }
    })()
  };
};
