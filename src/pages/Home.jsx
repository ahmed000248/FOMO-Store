import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiArrowRightLine } from 'react-icons/ri';

import Hero from '../components/home/Hero';
import { BrandBar, Stats, Newsletter } from '../components/home/HomeSections';
import { CategoryShowcase, FashionGallery, Testimonials } from '../components/home/Collections';
import ProductCard from '../components/ui/ProductCard';
import SEO from '../components/ui/SEO';
import { ProductGridSkeleton } from '../components/ui/skeletons/Skeletons';
import { useProducts } from '../hooks/useProducts';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

const SectionHeader = ({ tag, title, cta, ctaLink = '/products' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="flex items-end justify-between mb-10"
  >
    <div>
      <p className="text-accent-violet text-sm font-semibold tracking-[0.2em] uppercase mb-3">{tag}</p>
      <h2 className="section-title">{title}</h2>
    </div>
    {cta && (
      <Link
        to={ctaLink}
        className="hidden md:flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group"
      >
        {cta}
        <motion.span className="group-hover:translate-x-1 transition-transform">
          <RiArrowRightLine size={16} />
        </motion.span>
      </Link>
    )}
  </motion.div>
);

export default function Home() {
  const { products, loading } = useProducts();
  const { recentlyViewed } = useRecentlyViewed();

  const newArrivals = products.filter(p => p.isNew).slice(0, 4);
  const trending    = products.filter(p => p.isTrending || p.views > 50).sort((a,b) => (b.views||0) - (a.views||0)).slice(0, 4);
  // Best sellers = sort by reviews count desc
  const bestSellers = [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 4);

  // Fallback if no tagged products
  const displayNew      = newArrivals.length   ? newArrivals   : products.slice(0, 4);
  const displayTrending = trending.length      ? trending      : products.slice(1, 5);
  const displayBest     = bestSellers.length   ? bestSellers   : products.slice(0, 4);

  return (
    <main className="min-h-screen">
      <SEO
        title="Home"
        description="Welcome to LUXE — premium fashion for the modern individual."
      />
      <Hero />
      <BrandBar />

      {/* New Arrivals */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Just Dropped"
          title={<>New <span className="gradient-text italic">Arrivals</span></>}
          cta="View All"
          ctaLink="/products?badge=New"
        />
        {loading
          ? <ProductGridSkeleton count={4} />
          : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {displayNew.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )
        }
        <div className="flex justify-center mt-8 md:hidden">
          <Link to="/products" className="btn-outline text-text-primary text-sm">View All</Link>
        </div>
      </section>

      <Stats />

      {/* Trending */}
      <section className="py-24 bg-bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="What's Hot"
            title={<>Trending <span className="gradient-text-amber italic">Right Now</span></>}
            cta="View All"
            ctaLink="/products?sort=new"
          />
          {loading
            ? <ProductGridSkeleton count={4} />
            : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {displayTrending.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )
          }
        </div>
      </section>

      <CategoryShowcase />

      {/* Best Sellers */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            tag="Fan Favorites"
            title={<>Best <span className="gradient-text italic">Sellers</span></>}
            cta="Shop All"
            ctaLink="/products?sort=rating"
          />
          {loading
            ? <ProductGridSkeleton count={4} />
            : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {displayBest.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )
          }
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <section className="py-24 bg-bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              tag="Your History"
              title={<>Recently <span className="gradient-text italic">Viewed</span></>}
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {recentlyViewed.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      <FashionGallery />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
