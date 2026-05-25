import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiMessage3Line, RiCloseLine, RiSendPlane2Line, RiSparklingLine,
  RiArrowRightSLine, RiShoppingBag3Line, RiRefreshLine,
} from 'react-icons/ri';
import {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  sendMessageToStylist,
  STARTER_PROMPTS,
} from '../../services/chatbotService';
import { useSettings } from '../../context/SettingsContext';
import { useProducts } from '../../hooks/useProducts';

export default function AIChatbotStylist() {
  const [isOpen,     setIsOpen]     = useState(false);
  const [messages,   setMessages]   = useState([]);
  const [inputVal,   setInputVal]   = useState('');
  const [isTyping,   setIsTyping]   = useState(false);
  const [hasUnread,  setHasUnread]  = useState(true);  // badge until first open

  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  const { settings }    = useSettings();
  const { allProducts } = useProducts();
  const currencySymbol  = settings?.currencySymbol || 'Rs.';

  // Load history once on mount
  useEffect(() => {
    setMessages(loadChatHistory());
  }, []);

  // Smooth-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      handleOpen();
    }
  };

  const handleSend = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setInputVal('');
    setIsTyping(true);

    const result = await sendMessageToStylist(trimmed, messages, allProducts, settings);
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

  const handleReset = () => {
    clearChatHistory();
    window.location.reload();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputVal);
    }
  };

  return (
    <>
      {/* ── Floating Trigger Button ─────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        <motion.button
          onClick={handleToggle}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_25px_rgba(139,92,246,0.35)] transition-all ${
            isOpen
              ? 'bg-text-primary text-bg-primary'
              : 'bg-gradient-to-tr from-accent-violet via-indigo-600 to-accent-sky text-white'
          }`}
          aria-label="Chat with Nova"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{ rotate: 90,     opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <RiCloseLine size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                exit={{ scale: 0.8,    opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <RiMessage3Line size={24} />
                {/* Online dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent-emerald rounded-full border-2 border-indigo-600 shadow-[0_0_6px_#10b981]" />
                {/* Unread badge */}
                {hasUnread && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent-rose rounded-full border-2 border-indigo-600 flex items-center justify-center text-[9px] font-black text-white shadow-md"
                  >
                    1
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Chat Window ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.88, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:w-[410px] h-[560px] sm:h-[630px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] z-50 flex flex-col backdrop-blur-xl bg-slate-950/95 text-white"
          >
            {/* Ambient glows */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-violet/20 blur-[60px] rounded-full pointer-events-none -z-10" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-accent-sky/15 blur-[70px] rounded-full pointer-events-none -z-10" />

            {/* ── Header ── */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent-violet to-accent-sky flex items-center justify-center text-white shrink-0">
                  <RiSparklingLine size={20} className="animate-spin-slow" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent-emerald rounded-full border border-slate-900" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm tracking-wide flex items-center gap-1.5">
                    Nova
                    <span className="text-[9px] font-semibold tracking-widest uppercase text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-1.5 py-0.5 rounded-full">
                      Online
                    </span>
                  </h4>
                  <p className="text-[10px] text-white/50 mt-0.5">AI Shopping Assistant</p>
                </div>
              </div>

              <button
                onClick={handleReset}
                title="Clear conversation"
                className="text-[10px] uppercase font-bold tracking-wider text-white/40 hover:text-white transition-colors cursor-pointer border border-white/5 hover:border-white/15 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1"
              >
                <RiRefreshLine size={11} />
                Reset
              </button>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 scrollbar-hide">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender label */}
                  <span className={`text-[9px] font-bold tracking-widest uppercase mb-1.5 px-1 ${
                    msg.sender === 'user' ? 'text-accent-violet/70' : 'text-accent-sky/70'
                  }`}>
                    {msg.sender === 'user' ? 'You' : 'Nova'}
                  </span>

                  {/* Bubble */}
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 to-accent-violet text-white border-violet-500/20 rounded-tr-sm'
                        : 'text-white/90 border-white/8 rounded-tl-sm bg-white/6'
                    }`}
                  >
                    {msg.text && <p className="font-light">{msg.text}</p>}

                    {/* Product Cards */}
                    {msg.sender === 'stylist' && msg.recommendedProducts?.length > 0 && (
                      <div className={`space-y-2.5 ${msg.text ? 'mt-4 pt-4 border-t border-white/10' : ''}`}>
                        <p className="text-[9px] font-bold tracking-widest uppercase text-accent-sky flex items-center gap-1.5">
                          <RiShoppingBag3Line size={11} /> Recommended for you
                        </p>
                        {msg.recommendedProducts.map((prod) => (
                          <Link
                            key={prod.id}
                            to={`/products/${prod.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-2.5 rounded-xl border border-white/8 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                          >
                            <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-white/10">
                              <img
                                src={prod.image || prod.images?.[0] || ''}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-white truncate uppercase tracking-wide">
                                {prod.name}
                              </p>
                              <p className="text-[12px] font-bold text-accent-sky mt-0.5">
                                {currencySymbol} {prod.price}
                              </p>
                              {prod.originalPrice && (
                                <p className="text-[10px] text-white/35 line-through">
                                  {currencySymbol} {prod.originalPrice}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <span className="text-[9px] font-semibold text-accent-violet bg-accent-violet/10 border border-accent-violet/20 px-2 py-1 rounded-lg whitespace-nowrap">
                                View
                              </span>
                              <RiArrowRightSLine className="text-white/30 group-hover:text-white transition-colors" size={14} />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  {msg.timestamp && (
                    <span className="text-[8px] text-white/25 uppercase tracking-widest font-semibold mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-bold tracking-widest uppercase mb-1.5 px-1 text-accent-sky/70">
                    Nova
                  </span>
                  <div className="rounded-2xl rounded-tl-sm px-5 py-4 border border-white/8 bg-white/6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-violet animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-indigo-500  animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-accent-sky  animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* ── Starter prompts (only on empty chat) ── */}
            {messages.length <= 1 && !isTyping && (
              <div className="px-5 pb-2 shrink-0">
                <p className="text-[9px] font-bold tracking-widest text-white/35 uppercase mb-2">Quick questions</p>
                <div className="flex flex-wrap gap-1.5">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="text-[10px] font-medium tracking-wide border border-white/8 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/75 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Input Bar ── */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
              className="px-5 py-4 border-t border-white/5 bg-white/5 backdrop-blur-md flex gap-2.5 items-center shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Nova anything..."
                disabled={isTyping}
                className="flex-1 bg-slate-900 border border-white/10 hover:border-white/20 focus:border-accent-violet rounded-2xl px-4 py-3 text-xs text-white placeholder-white/35 focus:outline-none focus:ring-1 focus:ring-accent-violet/50 transition-all disabled:opacity-50"
              />
              <motion.button
                type="submit"
                disabled={!inputVal.trim() || isTyping}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-accent-violet to-accent-sky text-white flex items-center justify-center cursor-pointer shadow-md shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <RiSendPlane2Line size={16} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
