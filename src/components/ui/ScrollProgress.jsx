import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { RiArrowUpLine } from 'react-icons/ri';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 h-0.5 z-[100] bg-gradient-to-r from-accent-violet via-accent-sky to-accent-amber"
    />
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.button
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8, y: visible ? 0 : 20 }}
      transition={{ duration: 0.3 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-accent-violet to-accent-sky text-white flex items-center justify-center shadow-glow-violet pointer-events-auto"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9 }}
    >
      <RiArrowUpLine size={20} />
    </motion.button>
  );
}
