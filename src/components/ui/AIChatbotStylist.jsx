/**
 * AIChatbotStylist Component
 * 
 * Renders the floating AI fashion stylist assistant.
 * Incorporates Framer Motion, micro-interactions, responsive chat views,
 * typing loaders, and rich dynamic product recommendations that navigate to detail pages.
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiMessage3Line, RiCloseLine, RiSendPlane2Line, RiSparklingLine,
  RiShirtLine, RiArrowRightSLine, RiShoppingBag3Line
} from 'react-icons/ri';
import { loadChatHistory, saveChatHistory, sendMessageToStylist, STARTER_PROMPTS } from '../../services/chatbotService';
import { useSettings } from '../../context/SettingsContext';
import { useProducts } from '../../hooks/useProducts';

export default function AIChatbotStylist() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);
  const { settings } = useSettings();
  const { allProducts } = useProducts();
  const currencySymbol = settings?.currencySymbol || 'Rs.';

  // Initial load
  useEffect(() => {
    setMessages(loadChatHistory());
  }, []);

  // Scroll to bottom on updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setInputVal('');
    setIsTyping(true);

    // Call service to get updated history + pending response promise with live products
    const result = await sendMessageToStylist(trimmed, messages, allProducts);
    setMessages(result.history);

    try {
      const finalHistory = await result.promise;
      setMessages(finalHistory);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStarterClick = (prompt) => {
    handleSend(prompt);
  };

  const handleClearHistory = () => {
    sessionStorage.removeItem('fomo_stylist_chat');
    window.location.reload();
  };

  return (
    <>
      {/* ═══════════ FLOATING BUTTON ═══════════ */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_25px_rgba(139,92,246,0.35)] transition-all ${
            isOpen 
              ? 'bg-text-primary text-bg-primary' 
              : 'bg-gradient-to-tr from-accent-violet via-indigo-600 to-accent-sky text-white'
          }`}
          aria-label="AI Stylist Assistant"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <RiCloseLine size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <RiMessage3Line size={24} />
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#00ffc2] rounded-full border-2 border-indigo-600 shadow-[0_0_8px_#00ffc2]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ═══════════ CHAT CONTAINER ═══════════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:w-[410px] h-[550px] sm:h-[620px] rounded-[2.5rem] overflow-hidden border border-white/10 dark:border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] z-50 flex flex-col glass backdrop-blur-xl bg-slate-950/90 text-white"
          >
            {/* Ambient Back Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-violet/20 blur-[60px] rounded-full pointer-events-none -z-10" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-accent-sky/15 blur-[70px] rounded-full pointer-events-none -z-10" />

            {/* HEADER */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent-violet to-accent-sky flex items-center justify-center text-white relative">
                  <RiSparklingLine size={20} className="animate-spin-slow" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent-emerald rounded-full border border-slate-900" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm tracking-wide uppercase flex items-center gap-1.5">
                    FOMO AI Stylist
                  </h4>
                  <p className="text-[10px] text-accent-sky font-semibold tracking-widest uppercase">
                    Active Layer 02
                  </p>
                </div>
              </div>

              {/* Reset/Clear button */}
              <button
                onClick={handleClearHistory}
                className="text-[10px] uppercase font-bold tracking-wider text-white/40 hover:text-white transition-colors cursor-pointer border border-white/5 hover:border-white/10 px-2.5 py-1.5 rounded-lg bg-white/5"
              >
                Reset Chat
              </button>
            </div>

            {/* MESSAGES LOG CONTAINER */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Bubble */}
                  <div
                    className={`max-w-[85%] rounded-[1.5rem] p-4 text-sm leading-relaxed border ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 to-accent-violet text-white border-violet-500/20 rounded-tr-none'
                        : 'glass text-white border-white/5 rounded-tl-none bg-white/5'
                    }`}
                  >
                    <p className="font-light">{msg.text}</p>

                    {/* CLICKABLE STYLED PRODUCTS CARDS */}
                    {msg.sender === 'stylist' && msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3.5">
                        <p className="text-[9px] font-bold tracking-widest uppercase text-accent-sky flex items-center gap-1">
                          <RiShirtLine /> Suggested Fits:
                        </p>
                        <div className="grid grid-cols-1 gap-2.5">
                          {msg.recommendedProducts.map((prod) => (
                            <Link
                              key={prod.id}
                              to={`/products/${prod.id}`}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                            >
                              <div className="w-12 h-15 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/10">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-white truncate uppercase tracking-wide">
                                  {prod.name}
                                </p>
                                <p className="text-[10px] text-accent-sky font-semibold mt-0.5">
                                  {currencySymbol} {prod.price}
                                </p>
                              </div>
                              <RiArrowRightSLine className="text-white/40 group-hover:text-white transition-colors" size={16} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold mt-1 px-1">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))}

              {/* TYPING LOADER */}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="glass rounded-[1.5rem] rounded-tl-none px-5 py-4 border border-white/5 bg-white/5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-violet animate-pulse" />
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse [animation-delay:0.2s]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-sky animate-pulse [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* STARTER PILLS */}
            {messages.length <= 1 && !isTyping && (
              <div className="px-6 pb-2">
                <p className="text-[9px] font-bold tracking-widest text-white/40 uppercase mb-2">Suggested Triggers:</p>
                <div className="flex flex-wrap gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleStarterClick(prompt)}
                      className="text-[10px] font-medium tracking-wide border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/80 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* INPUT INPUT-BOX FORM */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputVal);
              }}
              className="p-5 border-t border-white/5 bg-white/5 backdrop-blur-md flex gap-2.5 items-center"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask your AI Stylist..."
                disabled={isTyping}
                className="flex-1 bg-slate-900 border border-white/10 hover:border-white/20 focus:border-accent-violet rounded-2xl px-4 py-3.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-accent-violet transition-all"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isTyping}
                className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-accent-violet to-accent-sky text-white flex items-center justify-center cursor-pointer shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all"
              >
                <RiSendPlane2Line size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
