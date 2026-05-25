/**
 * AIRecommendations Component
 * 
 * Renders the three premium recommendation sliders under the product details page:
 * 1. Styled For You
 * 2. Complete The Fit
 * 3. Recommended Essentials
 * 
 * Employs custom CSS horizontal sliding, luxury glassmorphic slider controls,
 * custom pulse skeletons, and premium entry animations.
 */
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { RiArrowLeftSLine, RiArrowRightSLine, RiSparklingLine, RiLayoutGridLine, RiMagicLine } from 'react-icons/ri';
import ProductCard from './ProductCard';

export default function AIRecommendations({ currentProduct, loading, styledForYou, completeTheFit, recommendedEssentials }) {
  
  // Custom scroll refs for the sliders
  const styledRef = useRef(null);
  const fitRef = useRef(null);
  const essentialRef = useRef(null);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Luxury Pulse Skeleton loader
  const RenderSkeletonSlider = ({ title, subtitle, icon: Icon }) => (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-white/10 animate-pulse" />
            <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="w-64 h-8 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-w-[280px] w-[280px] shrink-0 glass rounded-3xl p-4 border border-white/5 space-y-4">
            <div className="aspect-[3/4] bg-white/5 rounded-2xl animate-pulse" />
            <div className="w-16 h-3 bg-white/5 rounded animate-pulse" />
            <div className="w-40 h-5 bg-white/5 rounded animate-pulse" />
            <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="mt-20 border-t border-white/5 pt-16">
        <RenderSkeletonSlider />
        <RenderSkeletonSlider />
      </div>
    );
  }

  const SliderSection = ({ title, highlightWord, subtitle, products, scrollRef, icon: Icon, badgeText }) => {
    if (!products || products.length === 0) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-20 relative group/slider"
      >
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-accent-violet dark:text-accent-violet">
              <Icon className="animate-pulse" size={16} />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase bg-accent-violet/10 px-2.5 py-1 rounded-full border border-accent-violet/20">
                {badgeText}
              </span>
            </div>
            <h3 className="font-display text-3xl font-bold text-text-primary">
              {title} <span className="gradient-text italic">{highlightWord}</span>
            </h3>
            <p className="text-text-muted text-sm mt-1">{subtitle}</p>
          </div>

          {/* Luxury glassmorphic navigation buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button 
              onClick={() => scroll(scrollRef, 'left')}
              className="w-11 h-11 rounded-xl glass hover:bg-text-primary/10 border border-white/10 hover:border-white/20 text-text-primary flex items-center justify-center transition-all cursor-pointer"
            >
              <RiArrowLeftSLine size={20} />
            </button>
            <button 
              onClick={() => scroll(scrollRef, 'right')}
              className="w-11 h-11 rounded-xl glass hover:bg-text-primary/10 border border-white/10 hover:border-white/20 text-text-primary flex items-center justify-center transition-all cursor-pointer"
            >
              <RiArrowRightSLine size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic products list with horizontal overlay scroll */}
        <div className="relative">
          {/* Subtle scroll masks for premium dark theme */}
          <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300" />
          
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 scroll-smooth scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product, idx) => (
              <div key={product.id} className="min-w-[280px] w-[280px] md:min-w-[310px] md:w-[310px] shrink-0 snap-start">
                <ProductCard product={product} index={idx} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="mt-20 border-t border-white/10 pt-16">
      {/* Styled For You */}
      <SliderSection
        title="Styled"
        highlightWord="For You"
        subtitle="AI matches based on color affinities, styling aesthetics, and active interactions."
        products={styledForYou}
        scrollRef={styledRef}
        icon={RiSparklingLine}
        badgeText="AI RECOMMENDATION"
      />

      {/* Complete The Fit */}
      <SliderSection
        title="Complete"
        highlightWord="The Fit"
        subtitle="Essential outfitting recommendations curated to compile a flawless streetwear drip."
        products={completeTheFit}
        scrollRef={fitRef}
        icon={RiLayoutGridLine}
        badgeText="AI STYLIST PICK"
      />

      {/* Recommended Essentials / Trending With This */}
      <SliderSection
        title="Recommended"
        highlightWord="Essentials"
        subtitle="Hype catalog items trending with similar silhouettes and premium specs."
        products={recommendedEssentials}
        scrollRef={essentialRef}
        icon={RiMagicLine}
        badgeText="FOMO CORE SELECTION"
      />
    </div>
  );
}
