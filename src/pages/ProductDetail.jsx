// ─── Product Detail Page — Firebase-backed ───────────────────────────────────
import React, { useState, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiHeartLine, RiHeartFill, RiShoppingBagLine, RiCheckLine,
  RiStarFill, RiTruckLine, RiRefreshLine, RiShieldCheckLine,
  RiAddLine, RiSubtractLine, RiPulseLine, RiImage2Line, RiCompass3Line
} from 'react-icons/ri';
import { useCart } from '../context/useCart';
import { useWishlist } from '../context/useWishlist';
import { useAuth } from '../context/useAuth';
import { useSettings } from '../context/SettingsContext';
import { useProduct } from '../hooks/useProducts';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import ProductCard from '../components/ui/ProductCard';
import SEO from '../components/ui/SEO';
import { ProductDetailSkeleton } from '../components/ui/skeletons/Skeletons';
import { ProductReviews } from '../components/ui/ReviewSystem';
import { useRecommendations } from '../hooks/useRecommendations';
import AIRecommendations from '../components/ui/AIRecommendations';

// 3D viewer — lazy loaded only when user switches to 3D tab
const Product3D = lazy(() => import('../components/Product3D'));
import { useProductViews } from '../hooks/useProductViews';
import { trackEvent } from '../services/analyticsService';

const tabs = ['Product Details', 'Rating & Reviews', 'FAQs'];

export default function ProductDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { product, loading } = useProduct(id);
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed();
  
  // Track dynamic views on mount
  useProductViews(product);

  const {
    loading: recsLoading,
    styledForYou,
    completeTheFit,
    recommendedEssentials
  } = useRecommendations(product);

  React.useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize,  setSelectedSize]  = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity,      setQuantity]      = useState(1);
  const [activeTab,     setActiveTab]     = useState(0);
  const [addedToCart,   setAddedToCart]   = useState(false);
  const [zoomPos,       setZoomPos]       = useState({ x: 50, y: 50 });
  const [isZoomed,      setIsZoomed]      = useState(false);
  
  // Toggle between 2D Images and 3D Studio canvas
  const [viewMode, setViewMode] = useState('2d'); 

  const { addToCart }        = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const { user }             = useAuth();
  const { settings }         = useSettings();
  const sym                  = settings.currencySymbol || 'Rs.';

  if (loading) return <ProductDetailSkeleton />;

  if (!product) return (
    <main className="pt-28 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">🛍️</p>
        <h2 className="text-text-primary text-2xl font-semibold mb-3">Product not found</h2>
        <Link to="/products" className="btn-primary text-white">Browse Products</Link>
      </div>
    </main>
  );

  const wished   = isInWishlist(product.id);
  const images   = product.images || [product.image];
  const size     = selectedSize  || product.sizes?.[2] || 'M';
  const color    = selectedColor || product.colors?.[0];
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  const handleAddToCart = () => {
    addToCart({ ...product, quantity }, size, color);
    
    // Log event in Analytics
    trackEvent('add_to_cart', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: product.category
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlistToggle = () => {
    toggle(product);
    
    // Log Wishlist interaction event
    trackEvent('wishlist_add', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: product.category
    });
  };

  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <main className="pt-28 pb-20 min-h-screen relative overflow-hidden">
      
      {/* 🎬 CINEMATIC AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-28 left-6 w-[550px] h-[550px] bg-accent-violet/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[500px] right-6 w-[600px] h-[600px] bg-accent-sky/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-noise-overlay opacity-[0.015] pointer-events-none -z-10" />

      <SEO title={product.name} description={product.description} image={product.image} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-8 relative z-10">
          <Link to="/" className="hover:text-text-primary">Home</Link><span>/</span>
          <Link to="/products" className="hover:text-text-primary">Products</Link><span>/</span>
          <span className="text-text-primary">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 relative z-10">
          
          {/* ═══════════ GALLERY CONTAINER ═══════════ */}
          <div className="space-y-6">
            
            {/* 2D / 3D SWITCH BAR */}
            <div className="flex items-center justify-between glass border border-white/5 p-1.5 rounded-2xl bg-slate-950/20 backdrop-blur-md">
              <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase pl-3">Showcase Mode</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('2d')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    viewMode === '2d' 
                      ? 'bg-gradient-to-r from-accent-violet to-accent-sky text-white shadow-md' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <RiImage2Line size={14} />
                  2D Cinematic
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    viewMode === '3d' 
                      ? 'bg-gradient-to-r from-accent-violet to-accent-sky text-white shadow-md' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <RiCompass3Line size={14} />
                  3D Interactive
                </button>
              </div>
            </div>

            {/* VIEWER DISPLAY SWITCHBOARD */}
            <AnimatePresence mode="wait">
              {viewMode === '3d' ? (
                <motion.div
                  key="3d-viewer"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                >
                  <Suspense fallback={
                    <div className="h-[500px] flex items-center justify-center glass rounded-3xl border border-white/5">
                      <div className="text-center space-y-3">
                        <div className="w-10 h-10 rounded-full border-2 border-accent-violet/30 border-t-accent-violet animate-spin mx-auto" />
                        <p className="text-text-muted text-sm">Loading 3D Studio…</p>
                      </div>
                    </div>
                  }>
                    <Product3D product={product} />
                  </Suspense>
                </motion.div>
              ) : (
                <motion.div
                  key="2d-gallery"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-4"
                >
                  {(() => {
                    const displayImages = [...(product.images && product.images.length > 0 ? product.images : [product.image])];
                    while (displayImages.length < 5) {
                      displayImages.push(product.image);
                    }
                    const activeImg = displayImages[selectedImage] || product.image;

                    return (
                      <>
                        <motion.div
                          className="relative overflow-hidden rounded-3xl bg-bg-surface aspect-[4/5] cursor-zoom-in border border-white/5 shadow-2xl"
                          onMouseMove={handleMouseMove}
                          onMouseEnter={() => setIsZoomed(true)}
                          onMouseLeave={() => setIsZoomed(false)}
                        >
                          <motion.img
                            key={selectedImage}
                            src={activeImg}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: isZoomed ? 1.18 : 1 }}
                            style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                            transition={{ duration: isZoomed ? 0.1 : 0.4 }}
                          />
                          {product.badge && (
                            <div className={`absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest border shadow-sm ${
                              product.badge === 'New'      ? 'bg-accent-violet/20 text-accent-violet border-accent-violet/30' :
                              product.badge === 'Sale'     ? 'bg-accent-rose/20   text-accent-rose   border-accent-rose/30'   :
                                                             'bg-accent-amber/20  text-accent-amber  border-accent-amber/30'
                            }`}>
                              {product.badge}{discount && product.badge === 'Sale' ? ` −${discount}%` : ''}
                            </div>
                          )}
                        </motion.div>
                        
                        {/* Exactly 5 angle images below the main display */}
                        <div className="grid grid-cols-5 gap-3">
                          {displayImages.slice(0, 5).map((img, i) => (
                            <motion.button key={i} whileHover={{ scale: 1.06 }} onClick={() => setSelectedImage(i)}
                              className={`relative overflow-hidden rounded-2xl aspect-square w-full border-2 transition-all cursor-pointer ${selectedImage === i ? 'border-accent-violet shadow-[0_0_15px_rgba(139,92,246,0.3)] scale-[1.02]' : 'border-white/10'}`}>
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </motion.button>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══════════ DETAILS & SPECS INFO ═══════════ */}
          <div className="flex flex-col">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              
              {/* Badges Cluster */}
              <div className="flex flex-wrap items-center gap-3.5 mb-4">
                <p className="text-accent-sky text-xs uppercase tracking-widest font-bold">{product.category}</p>
                <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-[#00ffc2] bg-[#00ffc2]/10 border border-[#00ffc2]/20 px-3 py-1 rounded-full uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ffc2] animate-pulse" />
                  Limited Drop
                </span>
              </div>

              <h1 className="font-display text-4xl font-extrabold text-text-primary mb-4 leading-tight tracking-tight">{product.name}</h1>
              
              <div className="flex items-center gap-3.5 mb-6.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <RiStarFill key={i} size={13} className={i < Math.floor(product.rating || 0) ? 'text-accent-amber' : 'text-text-muted/20'} />
                  ))}
                </div>
                <span className="text-text-secondary text-xs font-semibold">{product.rating}/5</span>
                <span className="text-text-muted text-xs">({product.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl font-display font-black text-text-primary">{sym} {product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-text-muted text-xl line-through">{sym} {product.originalPrice}</span>
                    <span className="px-2.5 py-1 rounded-full bg-accent-rose/20 text-accent-rose text-xs font-bold uppercase tracking-wider">−{discount}%</span>
                  </>
                )}
              </div>

              <p className="text-text-secondary text-sm leading-relaxed mb-8 font-light">{product.description}</p>

              {/* Color */}
              {product.colors && (
                <div className="mb-6.5">
                  <p className="text-text-primary text-xs font-bold uppercase tracking-wider mb-3">Select Color</p>
                  <div className="flex gap-3">
                    {product.colors.map((c, i) => (
                      <motion.button key={i} whileHover={{ scale: 1.18 }} onClick={() => setSelectedColor(c)}
                        className={`w-9 h-9 rounded-full relative transition-transform cursor-pointer ${color === c ? 'ring-2 ring-accent-violet ring-offset-2 ring-offset-bg-primary' : ''}`}
                        style={{ backgroundColor: c }}>
                        {color === c && <RiCheckLine className="absolute inset-0 m-auto text-white" size={14} />}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size */}
              {product.sizes && (
                <div className="mb-8">
                  <div className="flex justify-between mb-3">
                    <p className="text-text-primary text-xs font-bold uppercase tracking-wider">Select Size</p>
                    <button className="text-accent-violet text-xs font-semibold hover:underline">Size Guide</button>
                  </div>
                  <div className="flex gap-2.5 flex-wrap">
                    {product.sizes.map(s => (
                      <motion.button key={s} whileHover={{ scale: 1.08 }} onClick={() => setSelectedSize(s)}
                        className={`w-14 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${size === s ? 'bg-gradient-to-tr from-accent-violet to-indigo-600 text-white shadow-glow-violet border-none' : 'glass text-text-secondary hover:text-text-primary border border-white/5 hover:border-white/10 bg-white/5'}`}>
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty + Add Actions */}
              <div className="flex gap-4 mb-8">
                <div className="flex items-center gap-3.5 glass rounded-2xl px-4.5 py-3 border border-white/5 bg-slate-950/20">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="cursor-pointer text-white/60 hover:text-white"><RiSubtractLine size={18} /></motion.button>
                  <span className="text-text-primary font-bold w-6 text-center text-sm">{quantity}</span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuantity(quantity + 1)} className="cursor-pointer text-white/60 hover:text-white"><RiAddLine size={18} /></motion.button>
                </div>
                
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-accent-violet to-accent-sky text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow-violet cursor-pointer">
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><RiCheckLine size={18} />Added!</motion.span>
                    ) : (
                      <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><RiShoppingBagLine size={18} />Add to Cart</motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={handleWishlistToggle}
                  className="w-14 h-14 rounded-2xl glass flex items-center justify-center border border-white/10 hover:border-accent-rose/30 cursor-pointer">
                  {wished ? <RiHeartFill className="text-accent-rose" size={22} /> : <RiHeartLine className="text-text-secondary" size={22} />}
                </motion.button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: RiTruckLine,       label: 'Free Shipping', sub: 'On orders $200+' },
                  { icon: RiRefreshLine,     label: 'Free Returns',  sub: '30-day policy'   },
                  { icon: RiShieldCheckLine, label: 'Secure Pay',    sub: 'SSL protected'   },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="glass rounded-2xl p-3.5 text-center border border-white/5 bg-white/5">
                    <Icon className="text-accent-violet mx-auto mb-1.5" size={18} />
                    <p className="text-text-primary text-[10px] font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-text-muted text-[9px] mt-0.5 font-light">{sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs System */}
        <div className="mb-20 relative z-10">
          <div className="flex gap-1 border-b border-white/15 mb-8">
            {tabs.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${activeTab === i ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
                {tab}
                {activeTab === i && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-violet to-accent-sky" />}
              </button>
            ))}
          </div>
          {activeTab === 0 && (
            <div className="glass rounded-3xl p-6.5 border border-white/5 bg-white/5">
              <p className="text-text-secondary leading-relaxed text-sm font-light">{product.description}</p>
              <ul className="mt-4 space-y-2.5">
                {['100% premium custom fabrications','Tailored silhouette and heavy drapery','Designed for everyday luxury utility','Crafted under certified fair-trade guidelines'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-text-secondary text-sm font-light">
                    <RiCheckLine className="text-[#00ffc2] flex-shrink-0" size={14} />{item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 1 && (
            <ProductReviews productId={product.id} />
          )}
          {activeTab === 2 && (
            <div className="space-y-3">
              {[
                { q: 'What is your shipping schedule?', a: 'Standard orders process in 1-2 business days with overnight tracked delivery.' },
                { q: 'How do sizing specs run?', a: 'Streetwear shapes feature a deliberate slightly boxy silhouette. Size down for a tighter fit.' },
                { q: 'Where are items manufactured?', a: 'Crafted inside boutique micro-factories utilizing certified organic materials.' },
              ].map(({ q, a }, i) => (
                <div key={i} className="glass rounded-3xl p-5 border border-white/5 bg-white/5">
                  <p className="text-text-primary font-bold text-sm mb-2">{q}</p>
                  <p className="text-text-muted text-sm font-light">{a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations & Outfitting */}
        <div className="relative z-10">
          <AIRecommendations
            currentProduct={product}
            loading={recsLoading}
            styledForYou={styledForYou}
            completeTheFit={completeTheFit}
            recommendedEssentials={recommendedEssentials}
          />
        </div>
      </div>
    </main>
  );
}
