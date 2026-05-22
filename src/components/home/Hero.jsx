import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  RiArrowRightLine, RiFireLine, RiStarFill,
  RiAwardLine, RiSparklingLine, RiCheckboxCircleLine,
} from 'react-icons/ri';
import { useSettings } from '../../context/SettingsContext';

// Stagger container variant
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// Floating particle dots
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  size: Math.random() * 3 + 1,
  dur: Math.random() * 6 + 4,
  delay: Math.random() * 4,
  opacity: Math.random() * 0.25 + 0.05,
}));

export default function Hero() {
  const { settings } = useSettings();
  const sectionRef = useRef(null);

  const brandName = settings?.storeName || 'FOMO';
  const heroSubtitle =
    settings?.heroSubtitle ||
    'Explore pieces that redefine modern luxury — crafted for those who move through the world with intention.';
  const titleLines = (settings?.heroTitle || 'Where Dark\nMeets Refined').split(/\\n|\n/);
  const titleLine1 = titleLines[0] || 'Where Dark';
  const titleLine2 = titleLines[1] || 'Meets Refined';

  // Curated product imagery
  const mainProductImg   = settings?.heroBannerUrl || 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?auto=format&fit=crop&w=800&q=80';
  const secondaryImg     = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80';
  const detailImg        = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80';

  // Smooth spring-based mouse parallax
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 60, damping: 18 });
  const springY = useSpring(rawY, { stiffness: 60, damping: 18 });

  const glowX    = useTransform(springX, [-0.5, 0.5], [-40, 40]);
  const glowY    = useTransform(springY, [-0.5, 0.5], [-40, 40]);
  const productX = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const productY = useTransform(springY, [-0.5, 0.5], [-18, 18]);
  const card1X   = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const card2X   = useTransform(springX, [-0.5, 0.5], [10, -10]);

  const handleMouseMove = (e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { rawX.set(0); rawY.set(0); }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505] pt-24 pb-16 lg:py-0 select-none"
    >
      {/* ═══════════ BACKGROUND SYSTEM ═══════════ */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">

        {/* Primary violet glow — breathes with parallax */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[20%] left-[5%] w-[650px] h-[650px] rounded-full blur-[160px]"
          style={{ x: glowX, y: glowY, background: 'radial-gradient(circle, #7c3aed 0%, transparent 65%)' }}
        />

        {/* Secondary sky glow */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.10, 0.20, 0.10] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-[25%] right-[2%] w-[750px] h-[750px] rounded-full blur-[190px]"
          style={{ x: glowX, y: glowY, background: 'radial-gradient(circle, #0284c7 0%, transparent 65%)' }}
        />

        {/* Accent rose mid-glow */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute top-[25%] left-[45%] w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, #e11d48 0%, transparent 65%)' }}
        />

        {/* Fine architectural grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_50%,#000_75%,transparent_100%)]" />

        {/* Animated particle dots */}
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{ left: p.x, top: p.y, width: p.size, height: p.size, opacity: p.opacity }}
            animate={{ y: [0, -20, 0], opacity: [p.opacity, p.opacity * 2, p.opacity] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}

        {/* Diagonal cinematic vignette */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30" />
      </div>

      {/* ═══════════ MAIN GRID ═══════════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-screen py-32 lg:py-0">

        {/* ───────────────── LEFT SIDE ───────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="lg:col-span-6 flex flex-col justify-center space-y-8 relative"
        >
          {/* Soft typography back-glow */}
          <div className="absolute -left-16 -top-16 w-[500px] h-[500px] bg-accent-violet/[0.04] blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* ── DROP badge ── */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 px-4 py-2 w-fit rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm">
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <RiFireLine className="text-accent-amber" size={13} />
            </motion.span>
            <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-text-secondary">
              DROP 02 / READY TO SHIP
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
          </motion.div>

          {/* ── Cinematic heading ── */}
          <motion.div variants={fadeUp} className="space-y-3 overflow-hidden">
            <h1 className="font-display leading-[0.88] flex flex-col">
              <span className="block text-6xl sm:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-white">
                {titleLine1.toUpperCase()}
              </span>
              <span
                className="block text-6xl sm:text-7xl lg:text-[5.5rem] font-light italic font-serif text-transparent bg-clip-text pl-3"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 40%, #e879f9 80%, #fb7185 100%)',
                  WebkitBackgroundClip: 'text',
                  filter: 'drop-shadow(0 0 30px rgba(124,58,237,0.3))',
                }}
              >
                {titleLine2}
              </span>
            </h1>
          </motion.div>

          {/* ── Subtitle ── */}
          <motion.p
            variants={fadeUp}
            className="text-text-muted text-base sm:text-[1.05rem] leading-relaxed max-w-[440px] font-light tracking-wide"
          >
            {heroSubtitle}
          </motion.p>

          {/* ── Trust metrics ── */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 text-[10.5px] font-semibold uppercase tracking-[0.16em]">
            <span className="flex items-center gap-1.5 text-text-primary">
              <RiStarFill className="text-accent-amber" size={11} />
              4.9★ Rating
            </span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span className="text-text-muted">10K+ Customers</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span className="text-text-muted flex items-center gap-1.5">
              <RiCheckboxCircleLine size={11} className="text-accent-emerald" />
              Fast Shipping
            </span>
          </motion.div>

          {/* ── CTA Buttons ── */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 items-center">
            {/* Primary CTA */}
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="relative group px-8 py-4 rounded-2xl bg-white text-black font-bold text-sm flex items-center gap-2.5 overflow-hidden shadow-[0_8px_32px_rgba(255,255,255,0.12)]"
              >
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                  animate={{ translateX: ['−100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                />
                Shop Collection
                <RiArrowRightLine className="group-hover:translate-x-1.5 transition-transform duration-300" size={16} />
              </motion.button>
            </Link>

            {/* Secondary glass CTA */}
            <Link to="/products?category=t-shirts">
              <motion.button
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-2xl border border-white/12 bg-white/[0.03] backdrop-blur-md text-white font-semibold text-sm flex items-center gap-2.5 hover:border-white/25 hover:bg-white/[0.07] transition-all duration-300 shadow-lg"
              >
                Explore Essentials
              </motion.button>
            </Link>
          </motion.div>

          {/* ── Floating glassmorphism feature tags ── */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2.5 max-w-[480px]">
            {[
              { text: 'Premium Fabric',     color: 'border-violet-500/25 text-violet-400', r: -2, d: 0.0 },
              { text: 'Nationwide Delivery', color: 'border-sky-500/25 text-sky-400',      r:  3, d: 0.12 },
              { text: 'Cash On Delivery',   color: 'border-rose-500/25 text-rose-400',    r: -1, d: 0.24 },
              { text: 'Oversized Fits',     color: 'border-emerald-500/25 text-emerald-400', r: 2, d: 0.36 },
            ].map((tag, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: 1, scale: 1,
                  y: [-5, 5, -5],
                  rotate: [tag.r - 1, tag.r + 1, tag.r - 1],
                }}
                transition={{
                  opacity: { delay: 0.6 + tag.d, duration: 0.4 },
                  scale:   { delay: 0.6 + tag.d, duration: 0.4 },
                  y:       { duration: 4 + idx * 0.5, repeat: Infinity, ease: 'easeInOut' },
                  rotate:  { duration: 5 + idx * 0.5, repeat: Infinity, ease: 'easeInOut' },
                }}
                className={`px-3.5 py-2 rounded-xl text-[9.5px] font-bold tracking-[0.18em] uppercase border bg-white/[0.02] backdrop-blur-sm ${tag.color}`}
              >
                {tag.text}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* ───────────────── RIGHT SIDE ───────────────── */}
        <div className="lg:col-span-6 relative h-[520px] sm:h-[640px] lg:h-[780px] flex items-center justify-center">

          {/* Huge low-opacity brand watermark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.028, scale: 1 }}
            transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
            className="absolute inset-0 flex items-center justify-center font-display font-black text-[22vw] lg:text-[16vw] tracking-[0.15em] text-white select-none pointer-events-none z-0"
          >
            {brandName.toUpperCase()}
          </motion.div>

          {/* Ambient glow beneath product */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[340px] h-[340px] rounded-full blur-[110px] z-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
          />

          {/* ══ MAIN PRODUCT IMAGE ══ */}
          <motion.div
            style={{ x: productX, y: productY }}
            initial={{ opacity: 0, scale: 0.88, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="absolute z-10 w-[64%] sm:w-[52%]"
          >
            <motion.div
              animate={{ y: [-14, 14, -14] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="aspect-[3/4] rounded-[36px] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.85)] border border-white/[0.08] group cursor-pointer relative"
            >
              <img
                src={mainProductImg}
                alt="Premium streetwear jacket"
                className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-106"
                style={{ willChange: 'transform' }}
              />
              {/* Inner vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/15 to-transparent pointer-events-none" />
              {/* Side edge shadow for depth */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />

              {/* Product label */}
              <div className="absolute bottom-7 left-7 right-7">
                <span className="inline-block text-[8.5px] font-bold tracking-[0.28em] uppercase text-accent-sky bg-accent-sky/10 border border-accent-sky/20 px-3 py-1 rounded-full mb-2">
                  RAW SELVEDGE / DROP 02
                </span>
                <h4 className="text-white text-lg font-bold font-display tracking-wide leading-tight">
                  Selvedge Denim Jacket
                </h4>
                <p className="text-white/50 text-xs mt-0.5 font-light">Raw Indigo · Heavyweight Weave</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ══ SECONDARY THUMBNAIL — bottom-left ══ */}
          <motion.div
            style={{ x: card2X }}
            initial={{ opacity: 0, x: -40, y: 40 }}
            animate={{ opacity: 1, x: 0, y: [20, -8, 20] }}
            transition={{
              opacity: { duration: 0.6, delay: 1 },
              x:       { duration: 0.6, delay: 1 },
              y:       { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            }}
            className="absolute bottom-12 left-0 z-20 w-[22%] sm:w-[18%] aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <img src={secondaryImg} alt="Hoodie texture" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </motion.div>

          {/* ══ SECONDARY THUMBNAIL — top-left ══ */}
          <motion.div
            style={{ x: card2X }}
            initial={{ opacity: 0, x: -30, y: -30 }}
            animate={{ opacity: 1, x: 0, y: [-12, 12, -12] }}
            transition={{
              opacity: { duration: 0.6, delay: 1.3 },
              x:       { duration: 0.6, delay: 1.3 },
              y:       { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
            }}
            className="absolute top-14 left-0 z-20 w-[19%] sm:w-[15%] aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <img src={detailImg} alt="Canvas pants detail" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>

          {/* ══ FLOATING CARD 1 — Trending (top-right) ══ */}
          <motion.div
            style={{ x: card1X }}
            initial={{ opacity: 0, x: 50, y: -30 }}
            animate={{
              opacity: 1, x: 0,
              y: [-12, 12, -12],
              rotate: [1, -1, 1],
            }}
            transition={{
              opacity: { duration: 0.5, delay: 0.7 },
              x:       { duration: 0.5, delay: 0.7 },
              y:       { duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
              rotate:  { duration: 6,   repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute top-10 right-4 sm:right-8 z-20 bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 flex-shrink-0">
              <RiFireLine size={17} />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest text-white/40 uppercase">TRENDING NOW</p>
              <p className="text-white text-xs font-semibold mt-0.5">Drop 02 · Limited</p>
            </div>
          </motion.div>

          {/* ══ FLOATING CARD 2 — Fabric (bottom-right) ══ */}
          <motion.div
            style={{ x: card1X }}
            initial={{ opacity: 0, x: 50, y: 40 }}
            animate={{
              opacity: 1, x: 0,
              y: [14, -10, 14],
              rotate: [-1.5, 1.5, -1.5],
            }}
            transition={{
              opacity: { duration: 0.5, delay: 0.9 },
              x:       { duration: 0.5, delay: 0.9 },
              y:       { duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 1 },
              rotate:  { duration: 7,   repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute bottom-20 right-2 sm:right-6 z-20 bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
              <RiAwardLine size={17} />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest text-white/40 uppercase">HEAVYWEIGHT FABRIC</p>
              <p className="text-white text-xs font-semibold mt-0.5">450GSM Terry Loop</p>
            </div>
          </motion.div>

          {/* ══ FLOATING CARD 3 — Premium Cut (mid-right) ══ */}
          <motion.div
            style={{ x: card1X }}
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{
              opacity: 1, scale: 1,
              y: [-9, 9, -9],
              rotate: [1.5, -1.5, 1.5],
            }}
            transition={{
              opacity: { duration: 0.5, delay: 1.1 },
              scale:   { duration: 0.5, delay: 1.1 },
              y:       { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
              rotate:  { duration: 5.8, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute right-0 top-[42%] -translate-y-1/2 z-20 bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400 flex-shrink-0">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                <RiSparklingLine size={17} />
              </motion.div>
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest text-white/40 uppercase">PREMIUM CUT</p>
              <p className="text-white text-xs font-semibold mt-0.5">Custom Drape & Fit</p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ═══════════ SCROLL CUE ═══════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-white/20">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[1px] h-8 bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}
