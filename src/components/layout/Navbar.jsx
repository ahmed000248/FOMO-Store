import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSearchLine,
  RiShoppingBagLine,
  RiHeart2Line,
  RiMenuLine,
  RiCloseLine,
  RiUserLine,
  RiArrowDownSLine,
  RiSunLine,
  RiMoonLine,
  RiLogoutBoxLine,
  RiDashboardLine,
  RiListOrdered,
} from "react-icons/ri";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { useProducts } from "../../hooks/useProducts";
import ProductCard from "../ui/ProductCard";

const navLinks = [
  {
    label: "Shop",
    href: "/products",
    children: ["New Arrivals", "Best Sellers", "Sale", "All Products"],
  },
  { label: "Collections", href: "/products?filter=collection" },
  { label: "About", href: "/about" },
];

export default function Navbar({ darkMode, toggleDark, onCartOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef();
  const userRef = useRef();

  const { itemCount } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, userDoc = null, isAdmin, logout } = useAuth() || {};
  const { settings } = useSettings();
  const { products } = useProducts(); // For smart search

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  // close user menu on outside click
  useEffect(() => {
    const fn = (e) => {
      if (userRef.current && !userRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const suggestions = searchQuery.trim() ? products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 4) : [];

  return (
    <>
      {/* Promo Bar */}
      <motion.div
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-accent-violet/20 via-accent-sky/10 to-accent-violet/20 border-b border-white/5 py-2 text-center text-xs text-text-secondary tracking-widest"
      >
        {settings.announcementText || 'FREE SHIPPING ON ORDERS OVER Rs. 2000'} &nbsp;·&nbsp;
        <Link
          to="/products?filter=sale"
          className="text-accent-violet hover:text-accent-sky transition-colors font-semibold"
        >
          SHOP SALE →
        </Link>
      </motion.div>

      {/* Main Nav */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-8 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "glass-dark shadow-2xl" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              {settings.logoUrl ? (
                <motion.img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  whileHover={{ scale: 1.05 }}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <>
                  <motion.div
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="text-white font-display font-bold text-sm">
                      {(settings.storeName || 'L')[0]}
                    </span>
                  </motion.div>
                  <span className="font-display text-xl font-bold gradient-text">
                    {settings.storeName || 'LUXE'}
                  </span>
                </>
              )}
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() =>
                    link.children && setDropdownOpen(link.label)
                  }
                  onMouseLeave={() => setDropdownOpen(null)}
                >
                  <Link
                    to={link.href}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${location.pathname === link.href
                      ? "text-accent-violet bg-accent-violet/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                      }`}
                  >
                    {link.label}
                    {link.children && (
                      <motion.span
                        animate={{
                          rotate: dropdownOpen === link.label ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <RiArrowDownSLine size={14} />
                      </motion.span>
                    )}
                  </Link>
                  <AnimatePresence>
                    {link.children && dropdownOpen === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-44 glass rounded-2xl shadow-card overflow-hidden"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child}
                            to={`/products?filter=${child.toLowerCase().replace(" ", "-")}`}
                            className="block px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                          >
                            {child}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
              >
                <RiSearchLine size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDark}
                className="hidden md:flex p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
              >
                {darkMode ? <RiSunLine size={20} /> : <RiMoonLine size={20} />}
              </motion.button>

              {/* Wishlist */}
              <Link to="/wishlist">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                  <RiHeart2Line size={20} />
                  {wishCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent-rose text-white text-[9px] font-bold flex items-center justify-center"
                    >
                      {wishCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onCartOpen}
                className="relative p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
              >
                <RiShoppingBagLine size={20} />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent-violet text-white text-[9px] font-bold flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </motion.button>

              {/* User Menu */}
              <div ref={userRef} className="relative">
                {user ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass border border-white/10 hover:border-accent-violet/30 transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center text-white text-xs font-bold">
                        {(user.displayName ||
                          user.email ||
                          "U")[0].toUpperCase()}
                      </div>
                      <span className="text-text-secondary text-xs max-w-[80px] truncate">
                        {user.displayName?.split(" ")[0] || "Account"}
                      </span>
                    </motion.button>
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className="absolute top-full right-0 mt-2 w-48 glass rounded-2xl shadow-card overflow-hidden border border-white/5"
                        >
                          <div className="px-4 py-3 border-b border-white/5">
                            <p className="text-text-primary text-sm font-medium truncate">
                              {user.displayName || "User"}
                            </p>
                            <p className="text-text-muted text-xs truncate">
                              {user.email}
                            </p>
                          </div>
                          {[
                            {
                              icon: RiListOrdered,
                              label: "My Orders",
                              href: "/orders",
                            },
                            {
                              icon: RiHeart2Line,
                              label: "Wishlist",
                              href: "/wishlist",
                            },
                            ...(isAdmin
                              ? [
                                {
                                  icon: RiDashboardLine,
                                  label: "Admin Panel",
                                  href: "/admin",
                                  accent: true,
                                },
                              ]
                              : []),
                          ].map(({ icon: Icon, label, href, accent }) => (
                            <Link
                              key={href}
                              to={href}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${accent ? "text-accent-violet" : "text-text-secondary hover:text-text-primary"}`}
                            >
                              <Icon size={16} />
                              {label}
                            </Link>
                          ))}
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent-rose hover:bg-accent-rose/5 transition-colors border-t border-white/5"
                          >
                            <RiLogoutBoxLine size={16} />
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link to="/login">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                    >
                      <RiUserLine size={20} />
                    </motion.div>
                  </Link>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
              >
                {mobileOpen ? (
                  <RiCloseLine size={22} />
                ) : (
                  <RiMenuLine size={22} />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-0 right-0 z-40 glass-dark border-b border-white/5 shadow-2xl md:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.href}
                    className="block px-4 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all font-medium"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="border-t border-white/5 pt-4 mt-4 space-y-1">
                {user ? (
                  <>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 text-sm"
                    >
                      <RiListOrdered size={16} />
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-accent-violet hover:bg-accent-violet/10 text-sm"
                      >
                        <RiDashboardLine size={16} />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-accent-rose hover:bg-accent-rose/5 text-sm w-full"
                    >
                      <RiLogoutBoxLine size={16} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 text-sm"
                  >
                    <RiUserLine size={16} />
                    Sign In
                  </Link>
                )}
                <button
                  onClick={toggleDark}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-text-secondary hover:bg-white/5 text-sm"
                >
                  {darkMode ? (
                    <RiSunLine size={16} />
                  ) : (
                    <RiMoonLine size={16} />
                  )}
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-32 px-4"
          >
            <div
              className="absolute inset-0 bg-bg-primary/90 backdrop-blur-xl"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              className="relative w-full max-w-2xl"
            >
              <form onSubmit={handleSearch} className="relative">
                <RiSearchLine
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted"
                  size={22}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, styles..."
                  className="w-full pl-14 pr-14 py-5 bg-bg-surface border border-white/10 rounded-2xl text-text-primary placeholder-text-muted text-lg focus:outline-none focus:border-accent-violet/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <RiCloseLine size={22} />
                </button>
              </form>
              
              <AnimatePresence>
                {searchQuery.trim() && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl p-4 shadow-2xl border border-white/5"
                  >
                    {suggestions.length > 0 ? (
                      <div>
                        <p className="text-text-muted text-xs uppercase tracking-wider mb-3">Suggestions</p>
                        <div className="grid grid-cols-2 gap-4">
                          {suggestions.map((p, i) => (
                            <Link 
                              key={p.id} 
                              to={`/products/${p.id}`}
                              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                              className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors"
                            >
                              <img src={p.image || p.images?.[0]} alt={p.name} className="w-14 h-14 object-cover rounded-lg" />
                              <div>
                                <p className="text-sm font-medium text-text-primary line-clamp-1">{p.name}</p>
                                <p className="text-xs text-accent-violet">{settings?.currencySymbol || 'Rs.'} {p.price}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <button 
                          onClick={handleSearch}
                          className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-sm font-medium rounded-xl transition-colors text-text-primary"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-text-muted text-sm">
                        No products found matching "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!searchQuery.trim() && (
                <p className="text-center text-text-muted text-sm mt-4">
                  Press Enter to search
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

