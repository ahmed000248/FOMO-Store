// ─── Product Detail Page — Firebase-backed ───────────────────────────────────
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiHeartLine, RiHeartFill, RiShoppingBagLine, RiCheckLine,
  RiStarFill, RiTruckLine, RiRefreshLine, RiShieldCheckLine,
  RiAddLine, RiSubtractLine, RiLockLine,
} from 'react-icons/ri';
import { useCart } from '../context/useCart';
import { useWishlist } from '../context/useWishlist';
import { useAuth } from '../context/useAuth';
import { useSettings } from '../context/SettingsContext';
import { useProduct } from '../hooks/useProducts';
import { useProducts } from '../hooks/useProducts';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import ProductCard from '../components/ui/ProductCard';
import SEO from '../components/ui/SEO';
import { ProductDetailSkeleton } from '../components/ui/skeletons/Skeletons';
import { ProductReviews } from '../components/ui/ReviewSystem';

const tabs = ['Product Details', 'Rating & Reviews', 'FAQs'];

export default function ProductDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { product, loading } = useProduct(id);
  const { products: allProducts } = useProducts({});
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed();
  
  // Smart Recommendations: Same category first, then fallback
  const relatedProducts = React.useMemo(() => {
    if (!product) return [];
    const others = allProducts.filter(p => String(p.id) !== String(id));
    const sameCategory = others.filter(p => p.category === product.category);
    const mixed = [...sameCategory, ...others.filter(p => p.category !== product.category)];
    return mixed.slice(0, 4);
  }, [allProducts, product, id]);

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
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <SEO title={product.name} description={product.description} image={product.image} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-8">
          <Link to="/" className="hover:text-text-primary">Home</Link><span>/</span>
          <Link to="/products" className="hover:text-text-primary">Products</Link><span>/</span>
          <span className="text-text-primary">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Gallery */}
          <div className="space-y-4">
            {(() => {
              const displayImages = [...(product.images && product.images.length > 0 ? product.images : [product.image])];
              while (displayImages.length < 5) {
                displayImages.push(product.image);
              }
              const activeImg = displayImages[selectedImage] || product.image;

              return (
                <>
                  <motion.div
                    className="relative overflow-hidden rounded-3xl bg-bg-surface aspect-[4/5] cursor-zoom-in"
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
                      animate={{ opacity: 1, scale: isZoomed ? 1.15 : 1 }}
                      style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                      transition={{ duration: isZoomed ? 0.1 : 0.4 }}
                    />
                    {product.badge && (
                      <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold border ${
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
                      <motion.button key={i} whileHover={{ scale: 1.05 }} onClick={() => setSelectedImage(i)}
                        className={`relative overflow-hidden rounded-xl aspect-square w-full border-2 transition-all ${selectedImage === i ? 'border-accent-violet' : 'border-white/10'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-text-muted text-xs uppercase tracking-widest mb-2">{product.category}</p>
              <h1 className="font-display text-4xl font-bold text-text-primary mb-4 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <RiStarFill key={i} size={14} className={i < Math.floor(product.rating || 0) ? 'text-accent-amber' : 'text-text-muted/30'} />
                  ))}
                </div>
                <span className="text-text-secondary text-sm">{product.rating}/5</span>
                <span className="text-text-muted text-sm">({product.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl font-display font-bold text-text-primary">{sym} {product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-text-muted text-xl line-through">{sym} {product.originalPrice}</span>
                    <span className="px-2 py-1 rounded-full bg-accent-rose/20 text-accent-rose text-sm font-semibold">−{discount}%</span>
                  </>
                )}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-8">{product.description}</p>

              {/* Color */}
              {product.colors && (
                <div className="mb-6">
                  <p className="text-text-primary text-sm font-medium mb-3">Color</p>
                  <div className="flex gap-3">
                    {product.colors.map((c, i) => (
                      <motion.button key={i} whileHover={{ scale: 1.15 }} onClick={() => setSelectedColor(c)}
                        className={`w-8 h-8 rounded-full relative ${color === c ? 'ring-2 ring-accent-violet ring-offset-2 ring-offset-bg-primary' : ''}`}
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
                    <p className="text-text-primary text-sm font-medium">Size</p>
                    <button className="text-accent-violet text-xs underline">Size Guide</button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map(s => (
                      <motion.button key={s} whileHover={{ scale: 1.08 }} onClick={() => setSelectedSize(s)}
                        className={`w-14 h-11 rounded-xl text-sm font-medium transition-all ${size === s ? 'bg-accent-violet text-white shadow-glow-violet' : 'glass text-text-secondary hover:text-text-primary border border-white/10'}`}>
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty + Add */}
              <div className="flex gap-4 mb-8">
                <div className="flex items-center gap-3 glass rounded-2xl px-4 py-3">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuantity(Math.max(1, quantity - 1))}><RiSubtractLine className="text-text-muted" size={18} /></motion.button>
                  <span className="text-text-primary font-semibold w-8 text-center">{quantity}</span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuantity(quantity + 1)}><RiAddLine className="text-text-muted" size={18} /></motion.button>
                </div>
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-accent-violet to-accent-sky text-white font-semibold flex items-center justify-center gap-2 shadow-glow-violet">
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><RiCheckLine size={18} />Added!</motion.span>
                    ) : (
                      <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2"><RiShoppingBagLine size={18} />Add to Cart</motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toggle(product)}
                  className="w-14 h-14 rounded-2xl glass flex items-center justify-center border border-white/10 hover:border-accent-rose/30">
                  {wished ? <RiHeartFill className="text-accent-rose" size={22} /> : <RiHeartLine className="text-text-secondary" size={22} />}
                </motion.button>
              </div>

              {/* Trust */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: RiTruckLine,       label: 'Free Shipping', sub: 'On orders $200+' },
                  { icon: RiRefreshLine,     label: 'Free Returns',  sub: '30-day policy'   },
                  { icon: RiShieldCheckLine, label: 'Secure Pay',    sub: 'SSL protected'   },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="glass rounded-xl p-3 text-center border border-white/5">
                    <Icon className="text-accent-violet mx-auto mb-1" size={18} />
                    <p className="text-text-primary text-xs font-medium">{label}</p>
                    <p className="text-text-muted text-[10px] mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-20">
          <div className="flex gap-1 border-b border-white/10 mb-8">
            {tabs.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={`px-6 py-3 text-sm font-medium transition-all relative ${activeTab === i ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
                {tab}
                {activeTab === i && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-violet to-accent-sky" />}
              </button>
            ))}
          </div>
          {activeTab === 0 && (
            <div className="glass rounded-2xl p-6 border border-white/5">
              <p className="text-text-secondary leading-relaxed">{product.description}</p>
              <ul className="mt-4 space-y-2">
                {['100% premium materials','Machine washable','Ethically manufactured','Sustainability certified'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-text-secondary text-sm">
                    <RiCheckLine className="text-accent-violet flex-shrink-0" size={14} />{item}
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
                { q: 'What is your return policy?', a: 'Free returns within 30 days of purchase. Items must be unworn and in original condition.' },
                { q: 'How long does delivery take?', a: 'Standard delivery 3-5 business days. Express 1-2 business days.' },
                { q: 'Do you ship internationally?', a: 'Yes! We ship to over 50 countries. Rates calculated at checkout.' },
              ].map(({ q, a }, i) => (
                <div key={i} className="glass rounded-2xl p-5 border border-white/5">
                  <p className="text-text-primary font-medium text-sm mb-2">{q}</p>
                  <p className="text-text-muted text-sm">{a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mb-20">
            <p className="text-accent-violet text-sm font-semibold tracking-[0.2em] uppercase mb-2">More to Explore</p>
            <h2 className="font-display text-3xl font-bold text-text-primary mb-8">You Might Also <span className="gradient-text italic">Like</span></h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.filter(p => String(p.id) !== String(id)).length > 0 && (
          <div>
            <p className="text-accent-violet text-sm font-semibold tracking-[0.2em] uppercase mb-2">Your History</p>
            <h2 className="font-display text-3xl font-bold text-text-primary mb-8">Recently <span className="gradient-text italic">Viewed</span></h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {recentlyViewed.filter(p => String(p.id) !== String(id)).slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
