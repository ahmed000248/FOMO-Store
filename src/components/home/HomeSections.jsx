import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { RiArrowRightLine, RiMailLine, RiSparklingLine } from 'react-icons/ri';
import { brandPartners } from '../../data/products';
import { useHomepageStats } from '../../hooks/useHomepageStats';
import { subscribeNewsletter } from '../../firebase/firestore';

// ─── Brand Marquee ────────────────────────────────────────────────────────────
export function BrandBar() {
  const doubled = [...brandPartners, ...brandPartners];
  return (
    <section className="py-8 border-y border-white/5 overflow-hidden bg-bg-secondary/50">
      <div className="relative">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {doubled.map((brand, i) => (
            <span
              key={i}
              className="text-text-muted/50 font-display font-bold text-lg tracking-[0.2em] hover:text-text-muted transition-colors cursor-default shrink-0"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Animated Stats ───────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export function Stats() {
  const { stats, loading } = useHomepageStats();

  const statCards = [
    {
      value:  stats.productCount,
      suffix: stats.productCount === 1 ? '' : '+',
      label:  'Curated Products',
      icon:   '✦',
      color:  '#8b5cf6',
    },
    {
      value:  stats.orderCount,
      suffix: '+',
      label:  'Orders Fulfilled',
      icon:   '🛍️',
      color:  '#38bdf8',
    },
    {
      value:  stats.userCount,
      suffix: '+',
      label:  'Happy Members',
      icon:   '❤️',
      color:  '#f59e0b',
    },
    {
      value:  stats.reviewCount,
      suffix: '+',
      label:  'Verified Reviews',
      icon:   '⭐',
      color:  '#10b981',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statCards.map(({ value, suffix, label, icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                className="glass rounded-2xl p-8 cursor-default transition-all duration-300 border border-white/5 hover:border-white/10"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <div className="text-4xl lg:text-5xl font-display font-bold mb-2" style={{ color }}>
                  {loading
                    ? <span className="opacity-30">—</span>
                    : <><AnimatedCounter target={value} suffix="" />{value > 0 ? suffix : ''}</>
                  }
                </div>
                <p className="text-text-muted text-sm">{label}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
export function Newsletter() {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSaving(true);
    try {
      await subscribeNewsletter(email);
    } catch {
      // subscribe fails silently — still show success UX
    } finally {
      setSaving(false);
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-accent-violet/5 via-accent-sky/5 to-accent-amber/5" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border border-white/5"
        >
          {/* Decorative orbs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-accent-violet/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-accent-sky/5 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-4"
            >
              <RiSparklingLine className="text-accent-violet" size={32} />
            </motion.div>

            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Stay in the <span className="gradient-text italic">Loop</span>
            </h2>
            <p className="text-text-muted max-w-md mx-auto mb-10">
              First access to new drops, exclusive offers, and style inspiration delivered straight to your inbox.
            </p>

            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-accent-violet/20 flex items-center justify-center text-3xl">✓</div>
                <p className="text-accent-violet font-semibold">You're on the list! Welcome to LUXE.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <div className="flex-1 relative">
                  <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-bg-surface border border-white/10 rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 transition-colors"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-white flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
                >
                  {saving ? 'Joining...' : <><span>Subscribe</span><RiArrowRightLine size={16} /></>}
                </motion.button>
              </form>
            )}
            <p className="text-text-muted text-xs mt-4">No spam. Unsubscribe at any time.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
