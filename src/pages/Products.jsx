// ─── Products Page — Firebase-backed ─────────────────────────────────────────
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiFilterLine, RiGridFill, RiSearchLine, RiCloseLine } from 'react-icons/ri';
import ProductCard from '../components/ui/ProductCard';
import { ProductGridSkeleton } from '../components/ui/skeletons/Skeletons';
import { useProducts } from '../hooks/useProducts';
import { useCategoryStats } from '../hooks/useCategoryStats';
import { categories } from '../data/products';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/ui/SEO';

const sortOptions = [
  { label: 'Featured',           value: 'featured'   },
  { label: 'Price: Low to High', value: 'price-asc'  },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated',          value: 'rating'     },
  { label: 'New Arrivals',       value: 'new'        },
];

export default function Products() {
  const { settings } = useSettings();
  const sym = settings.currencySymbol || 'Rs.';
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive filter state from URL — always in sync, no drift
  const activeCategory = searchParams.get('category') || searchParams.get('filter') || 'all';
  const sortBy         = searchParams.get('sort')     || 'featured';
  const activeBadge    = searchParams.get('badge')    || '';

  const [gridCols,   setGridCols]   = useState(4);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceMax,   setPriceMax]   = useState(500);
  const [search,     setSearch]     = useState(searchParams.get('search') || '');

  const { categoryCounts } = useCategoryStats();

  const setActiveCategory = (val) => setSearchParams(p => { const n = new URLSearchParams(p); n.set('category', val); n.delete('filter'); return n; });
  const setSortBy         = (val) => setSearchParams(p => { const n = new URLSearchParams(p); n.set('sort', val); return n; });
  const setActiveBadge    = (val) => setSearchParams(p => { const n = new URLSearchParams(p); if (val) n.set('badge', val); else n.delete('badge'); return n; });

  const { products: filtered, loading } = useProducts({
    category: activeCategory,
    search,
    priceMax,
    sort:     sortBy,
    badge:    activeBadge,
  });

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <SEO title="Shop Collection" description="Explore our entire collection of premium fashion." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-accent-violet text-sm font-semibold tracking-[0.2em] uppercase mb-2">Explore</p>
          <h1 className="section-title mb-2">All <span className="gradient-text italic">Collections</span></h1>
          <p className="text-text-muted">
            {loading ? 'Loading...' : `${filtered.length} products available`}
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-8 max-w-lg">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-12 pr-10 py-3.5 bg-bg-surface border border-white/10 rounded-2xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
              <RiCloseLine size={18} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(({ id, name, slug }) => {
            const count = slug === 'all' ? Object.values(categoryCounts).reduce((s,n) => s+n, 0) : (categoryCounts[slug] || 0);
            return (
              <motion.button key={id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCategory(slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  activeCategory === slug ? 'bg-accent-violet text-white shadow-glow-violet' : 'glass text-text-secondary hover:text-text-primary hover:bg-white/10'
                }`}
              >
                {name}
                {count > 0 && (
                  <span className={`text-xs font-bold ${activeCategory === slug ? 'text-white/70' : 'text-text-muted'}`}>
                    ({count})
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${filterOpen ? 'bg-accent-violet/20 text-accent-violet' : 'glass text-text-secondary hover:text-text-primary'}`}
            >
              <RiFilterLine size={16} /> Filters
            </button>
            <span className="text-text-muted text-xs hidden sm:block">{loading ? '...' : `${filtered.length} results`}</span>
          </div>
          <div className="flex items-center gap-3">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-bg-surface border border-white/10 rounded-xl px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-accent-violet/50">
              {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div className="hidden sm:flex gap-1 glass rounded-xl p-1">
              {[4, 3, 2].map(cols => (
                <button key={cols} onClick={() => setGridCols(cols)}
                  className={`p-1.5 rounded-lg transition-all ${gridCols === cols ? 'bg-accent-violet/20 text-accent-violet' : 'text-text-muted hover:text-text-primary'}`}>
                  <RiGridFill size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8">
              <div className="glass rounded-2xl p-6 border border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-text-primary text-sm font-medium block mb-3">Max Price: {sym} {priceMax}</label>
                    <input type="range" min="0" max="500" value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} className="w-full accent-accent-violet" />
                  </div>
                  <div>
                    <label className="text-text-primary text-sm font-medium block mb-3">Badge / Status</label>
                    <div className="flex gap-2 flex-wrap">
                      {['', 'New', 'Sale', 'Trending'].map(s => (
                        <button key={s || 'all'}
                          onClick={() => setActiveBadge(s)}
                          className={`px-3 py-1.5 rounded-full text-xs border transition-all font-medium ${
                            activeBadge === s
                              ? 'bg-accent-violet text-white border-accent-violet'
                              : 'glass text-text-secondary hover:text-accent-violet border-white/5'
                          }`}>
                          {s || 'All'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => { setSearch(''); setPriceMax(500); setSearchParams(new URLSearchParams()); }}
                      className="px-4 py-2 rounded-xl glass text-text-secondary hover:text-text-primary text-sm border border-white/10">
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={gridCols * 2} />
        ) : filtered.length > 0 ? (
          <motion.div layout className={`grid gap-4 md:gap-6 ${gridCols === 4 ? 'grid-cols-2 lg:grid-cols-4' : gridCols === 3 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            <AnimatePresence>
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-text-primary text-xl font-semibold">No products found</h3>
            <p className="text-text-muted text-sm">Try adjusting your filters or search term</p>
            <button onClick={() => { setSearch(''); setPriceMax(500); setSearchParams(new URLSearchParams()); }} className="btn-primary text-white">Clear Filters</button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
