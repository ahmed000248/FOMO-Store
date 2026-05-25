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

  const brandName = settings?.storeName || 'FOMO';
  const heroSubtitle =
    settings?.heroSubtitle ||
    'If you know, you know. Exclusive apparel for the digitally native. Our limited release collection blends high-fashion silhouettes with utilitarian hardware.';
  
  const titleLines = (settings?.heroTitle || 'NEVER MISS\nThe DROP').split(/\\n|\n/);
  const titleLine1 = titleLines[0] || 'NEVER MISS';
  const titleLine2 = titleLines[1] || 'The DROP';

  // Stitch high-resolution imagery assets
  const mainProductImg = settings?.heroBannerUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9mchCwjDfUPKqPpxwyg_Zk2B98ZgAlmaRo7I2SjA2V2OxXqJfcvmlJUmK730uTs_11czO3yDz1Wz7_ooKzDupmdsR7VVeX_i1ubgA0t1pVgoWPm4_5YaUFYawNNEbmI692UW14f111MaoSrr8b3k2if-dVziAcQCDJzPn6570yjCBy1v-rZrIX1_nkeKqwrJuiv6iCTI1fOP5SGwOG0Cu4qeZKPk5QUHAyk79_TloeLwCaBFoVoAGc50qpWMxxyorAOad6nYUeAI';
  const secondaryImg   = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKKCTM5JSmCN8beAah8CjMKW9yldUgKzZSULux1EsRsbJR2F3oVh_Jpd94hPvBm3h0zp2EiEz_dlCewEAFbGTNaJPoqOK3NQ3YuACG_BauZFk4I1KGSYKqwozy06tPCK7SpOTdaFiOD6_zr51uEbz03aOv4Ob_z811HtNvAXMki1rHmgVRlaGl8WQaeSiPZtT-Btnup0KsDLW9qUuQt-BPMf8ZKxzrZRQwCkDExH5AzPu53dv_XlxnOfpmg6Hl-0ir8qPHnvrREpE';
  const detailImg      = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV01rAgkUTHLIplEl9Y6mY0bo7yiJTjFeLwjqLWy8UbL7wa1Dsix6emLdIsJ3xnoGhX4zJbWo2NlCzVTSQlU6Vntr9Na_rWrrVK0kizjT--zi2mPz6bOkVdCorFTD-lBt_tfwANTjoAbb2pjtMciNH6WF5tSNy3GLE42yXPZkdHbDd-KyKOm7PVoyY4LZo8DZhBtvVlzHYbooJDXDFRAl9yOfYGVMVdb8wLKoWmbHYOML0ubtd5r7DAjcidd3ZgiapfmUU3jVsbEU';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary pt-32 pb-32 lg:py-0 select-none transition-colors duration-300">
      {/* ═══════════ BACKGROUND SYSTEM ═══════════ */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Ambient Watercolor Glows */}
        <div
          className="absolute -top-[20%] left-[5%] w-[650px] h-[650px] rounded-full blur-[160px]"
          style={{ background: 'radial-gradient(circle, var(--hero-glow-1) 0%, transparent 65%)' }}
        />
        <div
          className="absolute -bottom-[25%] right-[2%] w-[750px] h-[750px] rounded-full blur-[190px]"
          style={{ background: 'radial-gradient(circle, var(--hero-glow-2) 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-[25%] left-[45%] w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, var(--hero-glow-3) 0%, transparent 65%)' }}
        />

        {/* Fine Architectural Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_50%,#000_75%,transparent_100%)]" />

        {/* Animated Particle Dots */}
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-accent-violet dark:bg-white"
            style={{ left: p.x, top: p.y, width: p.size, height: p.size, opacity: p.opacity * 0.7 }}
            animate={{ y: [0, -20, 0], opacity: [p.opacity * 0.7, p.opacity * 1.4, p.opacity * 0.7] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}

        {/* Diagonal Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-br dark:from-black/30 from-white/10 via-transparent dark:to-black/30 to-white/10" />
      </div>

      {/* ═══════════ MAIN GRID ═══════════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-screen py-32 lg:py-0">

        {/* ───────────────── LEFT SIDE ───────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="lg:col-span-7 flex flex-col justify-center space-y-8 relative"
        >
          {/* Soft typography back-glow */}
          <div className="absolute -left-16 -top-16 w-[500px] h-[500px] bg-accent-violet/[0.04] blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* ── DROP badge ── */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-text-primary/10 dark:border-white/10 bg-text-primary/5 dark:bg-white/5 backdrop-blur-sm w-fit">
            <span className="w-2 h-2 rounded-full bg-[#00FFC2] shadow-[0_0_8px_#00FFC2]" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-text-primary">
              DROP 02 / READY TO SHIP
            </span>
          </motion.div>

          {/* ── Cinematic heading ── */}
          <motion.div variants={fadeUp} className="space-y-3 overflow-hidden">
            <h1 className="font-display-xl leading-[0.9] flex flex-col tracking-tighter">
              <span className="block text-6xl sm:text-7xl lg:text-[5.5rem] font-black text-text-primary">
                {titleLine1.toUpperCase()}
              </span>
              <span
                className="block text-6xl sm:text-7xl lg:text-[5.5rem] font-light italic font-serif text-transparent bg-clip-text pl-2"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 40%, #e879f9 80%, #fb7185 100%)',
                  WebkitBackgroundClip: 'text',
                  filter: 'drop-shadow(0 0 30px rgba(124,58,237,0.25))',
                }}
              >
                {titleLine2}
              </span>
            </h1>
          </motion.div>

          {/* ── Subtitle ── */}
          <motion.p
            variants={fadeUp}
            className="text-text-secondary text-base sm:text-[1.05rem] leading-relaxed max-w-lg font-light"
          >
            {heroSubtitle}
          </motion.p>

          {/* ── Trust metrics ── */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 text-[10.5px] font-semibold uppercase tracking-[0.16em]">
            <span className="flex items-center gap-1.5 text-text-primary">
              <RiStarFill className="text-accent-amber" size={12} />
              4.9★ Rating
            </span>
            <span className="w-1 h-1 rounded-full bg-text-muted/30" />
            <span className="text-text-muted">10K+ Customers</span>
            <span className="w-1 h-1 rounded-full bg-text-muted/30" />
            <span className="text-text-muted flex items-center gap-1.5">
              <RiCheckboxCircleLine size={12} className="text-accent-emerald" />
              Fast Shipping
            </span>
          </motion.div>

          {/* ── CTA Buttons ── */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 items-center">
            {/* Primary CTA */}
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] transition-all flex items-center gap-3 cursor-pointer shadow-md"
              >
                Shop Collection
                <RiArrowRightLine size={14} />
              </motion.button>
            </Link>

            {/* Secondary glass CTA */}
            <Link to="/products?category=t-shirts">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 glass rounded-full font-bold text-xs uppercase tracking-widest text-text-primary hover:bg-text-primary/10 transition-all border border-text-primary/10 hover:border-text-primary/20 cursor-pointer shadow-sm"
              >
                Explore Essentials
              </motion.button>
            </Link>
          </motion.div>

          {/* ── Feature tags ── */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2.5 max-w-lg">
            {[
              { text: 'Premium Fabric',     color: 'dark:border-violet-500/25 border-violet-500/15 dark:text-violet-400 text-violet-600' },
              { text: 'Nationwide Delivery', color: 'dark:border-sky-500/25 border-sky-500/15 dark:text-sky-400 text-sky-600' },
              { text: 'Cash On Delivery',   color: 'dark:border-rose-500/25 border-rose-500/15 dark:text-rose-400 text-rose-600' },
              { text: 'Oversized Fits',     color: 'dark:border-emerald-500/25 border-emerald-500/15 dark:text-emerald-400 text-emerald-600' },
            ].map((tag, idx) => (
              <span
                key={idx}
                className={`px-4 py-2 bg-text-primary/5 dark:bg-white/5 rounded-lg border text-[10px] font-bold tracking-wide uppercase transition-all hover:bg-text-primary/10 ${tag.color}`}
              >
                {tag.text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ───────────────── RIGHT SIDE ───────────────── */}
        <div className="lg:col-span-5 relative h-[520px] sm:h-[640px] lg:h-[720px] flex items-center justify-center">

          {/* Top-left secondary floating image */}
          <div className="absolute -top-6 -left-8 w-40 h-56 rounded-xl overflow-hidden border border-text-primary/10 dark:border-white/10 shadow-2xl z-20 hidden xl:block transition-all duration-500 hover:-translate-y-2">
            <img className="w-full h-full object-cover" src={secondaryImg} alt="Denim texture close-up" />
          </div>

          {/* ══ MAIN PRODUCT IMAGE ══ */}
          <div className="relative group w-[85%] lg:w-[80%] mx-auto transition-all duration-500">
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden border border-text-primary/10 dark:border-white/10 relative shadow-[0_40px_100px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
              <img
                src={mainProductImg}
                alt="Selvedge denim jacket"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Inner gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-8" />

              {/* Product labels */}
              <div className="absolute bottom-8 left-8 right-8 z-10">
                <span className="inline-block text-[9px] font-bold tracking-[0.2em] uppercase text-accent-sky bg-accent-sky/10 border border-accent-sky/20 px-3 py-1 rounded-full mb-2">
                  RAW SELVEDGE / DROP 02
                </span>
                <h4 className="text-white text-xl font-bold font-display tracking-wide leading-tight">
                  Selvedge Denim Jacket
                </h4>
                <p className="text-white/60 text-xs mt-0.5 font-light">Raw Indigo · Heavyweight Weave</p>
              </div>
            </div>

            {/* Floating Badges */}
            {/* Premium Cut badge */}
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 glass px-6 py-4 rounded-2xl flex items-center gap-4 border border-text-primary/10 dark:border-white/10 shadow-2xl z-30 max-w-[220px] transition-all duration-500 hover:scale-105">
              <div className="w-10 h-10 rounded-full bg-accent-violet/10 flex items-center justify-center text-accent-violet flex-shrink-0">
                <RiAwardLine size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-text-primary uppercase mb-0.5">Premium Cut</p>
                <p className="text-[9px] text-text-muted uppercase font-medium leading-tight">Custom Drape & Fit Engineered for Comfort</p>
              </div>
            </div>

            {/* Heavyweight Fabric badge */}
            <div className="absolute -bottom-8 -left-4 glass px-5 py-4 rounded-2xl flex items-center gap-4 border border-text-primary/10 dark:border-white/10 shadow-2xl z-30 transition-all duration-500 hover:scale-105">
              <div className="w-9 h-9 rounded-xl bg-accent-sky/10 flex items-center justify-center text-accent-sky flex-shrink-0">
                <RiFireLine size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-text-primary uppercase mb-0.5">Heavyweight Fabric</p>
                <p className="text-[9px] text-text-muted uppercase font-medium">450GSM Terry Loop</p>
              </div>
            </div>
          </div>

          {/* Bottom-right secondary floating image */}
          <div className="absolute -bottom-16 -right-12 w-48 h-64 rounded-xl overflow-hidden border border-text-primary/10 dark:border-white/10 shadow-2xl z-10 hidden lg:block transition-all duration-500 hover:translate-y-2">
            <img className="w-full h-full object-cover" src={detailImg} alt="Premium stacked tshirts fabric folded" />
          </div>

        </div>
      </div>

      {/* ═══════════ SCROLLING MARQUEE ═══════════ */}
      <div className="absolute bottom-0 w-full py-6 overflow-hidden bg-bg-secondary/40 border-t border-text-primary/10 dark:border-white/10 whitespace-nowrap z-20 backdrop-blur-sm transition-colors duration-300">
        <div className="inline-flex gap-16 animate-marquee">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="inline-flex items-center gap-16">
              <span className="font-display font-black text-2xl sm:text-3xl uppercase italic tracking-tighter text-text-muted/20">DROP 02 LIVE NOW</span>
              <span className="font-display font-black text-2xl sm:text-3xl uppercase italic tracking-tighter text-text-muted/20">•</span>
              <span className="font-display font-black text-2xl sm:text-3xl uppercase italic tracking-tighter text-text-muted/20">LIMITED STOCK</span>
              <span className="font-display font-black text-2xl sm:text-3xl uppercase italic tracking-tighter text-text-muted/20">•</span>
              <span className="font-display font-black text-2xl sm:text-3xl uppercase italic tracking-tighter text-text-muted/20">EXCLUSIVE RELEASE</span>
              <span className="font-display font-black text-2xl sm:text-3xl uppercase italic tracking-tighter text-text-muted/20">•</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
