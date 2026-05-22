import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiHeart2Line, RiHeart2Fill, RiShoppingBagLine, RiStarFill, RiEyeLine } from 'react-icons/ri';
import { useCart } from '../../context/useCart';
import { useWishlist } from '../../context/useWishlist';
import { useSettings } from '../../context/SettingsContext';

const badgeColors = {
  New: 'bg-accent-violet/20 text-accent-violet border-accent-violet/30',
  Sale: 'bg-accent-rose/20 text-accent-rose border-accent-rose/30',
  Trending: 'bg-accent-amber/20 text-accent-amber border-accent-amber/30',
};

export default function ProductCard({ product, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const { settings } = useSettings();
  const sym = settings.currencySymbol || 'Rs.';
  const wished = isInWishlist(product.id);

  const outOfStock = product.stock === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    setAddingToCart(true);
    addToCart(product, product.sizes?.[2] || 'M');
    setTimeout(() => setAddingToCart(false), 800);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/products/${product.id}`}>
        <div
          className="product-card group cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Image Container */}
          <div className="relative overflow-hidden aspect-[3/4] bg-bg-surface">
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              animate={{ scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              loading="lazy"
            />

            {/* Gradient Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent"
              animate={{ opacity: hovered ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
            />

            {/* Badge */}
            {product.stock === 0 ? (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border bg-white/10 text-text-muted border-white/20">
                Out of Stock
              </div>
            ) : product.badge ? (
              <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColors[product.badge]}`}>
                {product.badge}
                {discount && product.badge === 'Sale' && ` −${discount}%`}
              </div>
            ) : null}

            {/* Low stock warning */}
            {typeof product.stock === 'number' && product.stock > 0 && product.stock <= 5 && (
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-amber/20 text-accent-amber border border-accent-amber/30">
                Only {product.stock} left
              </div>
            )}

            {/* Wishlist Button */}
            <motion.button
              onClick={(e) => { e.preventDefault(); toggle(product); }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : -10 }}
              transition={{ duration: 0.25 }}
              className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center"
            >
              {wished ? (
                <RiHeart2Fill className="text-accent-rose" size={18} />
              ) : (
                <RiHeart2Line className="text-white" size={18} />
              )}
            </motion.button>

            {/* Quick View */}
            <motion.div
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="absolute bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <span className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-xs text-white font-medium">
                <RiEyeLine size={12} /> Quick View
              </span>
            </motion.div>

            {/* Add to Cart Button */}
            <motion.button
              onClick={handleAddToCart}
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 20 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className={`absolute bottom-3 left-3 right-3 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 overflow-hidden ${outOfStock ? 'bg-white/10 cursor-not-allowed' : 'bg-gradient-to-r from-accent-violet to-accent-sky'}`}
              whileHover={{ scale: outOfStock ? 1 : 1.02 }}
              whileTap={{ scale: outOfStock ? 1 : 0.98 }}
            >
              <AnimatePresence mode="wait">
                {addingToCart ? (
                  <motion.span
                    key="adding"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.5, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Adding...
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <RiShoppingBagLine size={16} />
                    {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <p className="text-text-muted text-xs uppercase tracking-widest mb-1">{product.category}</p>
            <h3 className="text-text-primary font-medium text-sm mb-2 truncate">{product.name}</h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <RiStarFill
                    key={i}
                    size={11}
                    className={i < Math.floor(product.rating) ? 'text-accent-amber' : 'text-text-muted/30'}
                  />
                ))}
              </div>
              <span className="text-text-muted text-xs">{product.rating} ({product.reviews})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-text-primary font-semibold">{sym} {product.price}</span>
              {product.originalPrice && (
                <span className="text-text-muted text-sm line-through">{sym} {product.originalPrice}</span>
              )}
              {discount && (
                <span className="text-accent-rose text-xs font-semibold ml-auto">−{discount}%</span>
              )}
            </div>

            {/* Color Swatches */}
            {product.colors && (
              <div className="flex gap-1.5 mt-3">
                {product.colors.slice(0, 4).map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-white/10 cursor-pointer hover:scale-125 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
