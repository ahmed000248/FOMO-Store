import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiArrowRightLine, RiArrowLeftSLine, RiArrowRightSLine, RiStarFill, RiVerifiedBadgeFill } from 'react-icons/ri';
import { styleCategories, galleryImages } from '../../data/products';
import { useCategoryStats } from '../../hooks/useCategoryStats';
import { useFeaturedReviews } from '../../hooks/useReviews';

// ─── Category Showcase — dynamic counts from Firestore ────────────────────────
export function CategoryShowcase() {
  const { getCount, loading } = useCategoryStats();

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-accent-violet text-sm font-semibold tracking-[0.2em] uppercase mb-3">Curated Styles</p>
            <h2 className="section-title">Browse by <span className="gradient-text italic">Category</span></h2>
          </div>
          <Link to="/products" className="hidden md:flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
            All Products <RiArrowRightLine size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {styleCategories.map(({ name, slugs, link, image }, i) => {
            const count = getCount(slugs);
            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={link}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative overflow-hidden rounded-2xl cursor-pointer group aspect-[3/4]"
                  >
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-text-primary font-display font-bold text-xl">{name}</h3>
                      <p className="text-text-muted text-sm mt-0.5">
                        {loading
                          ? <span className="inline-block w-12 h-3 shimmer-skeleton rounded-full" />
                          : `${count} ${count === 1 ? 'piece' : 'pieces'}`
                        }
                      </p>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '40%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                        className="h-0.5 bg-gradient-to-r from-accent-violet to-transparent mt-3"
                      />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Instagram-Style Gallery ──────────────────────────────────────────────────
export function FashionGallery() {
  return (
    <section className="py-24 bg-bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-accent-violet text-sm font-semibold tracking-[0.2em] uppercase mb-3">@luxefashion</p>
          <h2 className="section-title">As <span className="gradient-text italic">Styled</span> by Our Community</h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {galleryImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ scale: 1.04, zIndex: 10 }}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group ${i === 0 || i === 5 ? 'row-span-2 col-span-1' : ''}`}
              style={{ aspectRatio: i === 0 || i === 5 ? '1/2' : '1/1' }}
            >
              <img
                src={img}
                alt={`Gallery ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-accent-violet/30 flex items-center justify-center"
              >
                <span className="text-white font-semibold text-sm">View Look</span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link to="/products" className="btn-outline text-text-primary inline-flex items-center gap-2">
            Shop the Look <RiArrowRightLine size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials — real reviews from Firestore, hidden if none exist ─────────
export function Testimonials() {
  const [active, setActive] = useState(0);
  const { reviews: firestoreReviews, loading } = useFeaturedReviews(4);

  // Return null if there are no genuine reviews yet, keeping homepage strictly authentic
  if (!loading && firestoreReviews.length === 0) return null;

  const testimonialData = firestoreReviews.map((r, i) => ({
    id: r.id || i,
    name: r.userName || 'Verified Customer',
    role: 'Verified Purchase',
    avatar: null,
    content: r.comment,
    rating: Math.round(r.rating || 5),
    verified: r.verified,
  }));

  const displayCount = Math.min(testimonialData.length, 4);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-accent-violet/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent-violet text-sm font-semibold tracking-[0.2em] uppercase mb-3">Testimonials</p>
          <h2 className="section-title">Our <span className="gradient-text italic">Happy</span> Customers</h2>
          {firestoreReviews.length > 0 && (
            <p className="text-text-muted text-sm mt-3">
              Real reviews from verified purchases
              <span className="inline-flex items-center gap-1 ml-2 text-accent-emerald">
                <RiVerifiedBadgeFill size={13} /> Verified
              </span>
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="hidden md:grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-3xl p-8 border border-white/5 space-y-4">
                <div className="flex gap-1">{[...Array(5)].map((_, j) => <div key={j} className="w-3 h-3 shimmer-skeleton rounded-full" />)}</div>
                <div className="h-16 shimmer-skeleton rounded-xl" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full shimmer-skeleton" />
                  <div className="space-y-1.5"><div className="h-3 shimmer-skeleton rounded-full w-24" /><div className="h-2.5 shimmer-skeleton rounded-full w-16" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop: 3 cards */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              {testimonialData.slice(0, 3).map(({ id, name, role, avatar, content, rating, verified }, i) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  whileHover={{ y: -4 }}
                  className="glass rounded-3xl p-8 border border-white/5 hover:border-accent-violet/20 transition-all duration-300"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <RiStarFill key={j} size={14} className={j < rating ? 'text-accent-amber' : 'text-text-muted/20'} />
                    ))}
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-6">"{content}"</p>
                  <div className="flex items-center gap-3">
                    {avatar
                      ? <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover ring-2 ring-accent-violet/30" />
                      : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )
                    }
                    <div>
                      <p className="text-text-primary font-semibold text-sm">{name}</p>
                      <div className="flex items-center gap-1">
                        {verified && <RiVerifiedBadgeFill className="text-accent-emerald" size={11} />}
                        <p className="text-text-muted text-xs">{role}</p>
                      </div>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-accent-emerald" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile: carousel */}
            <div className="md:hidden">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-3xl p-6 border border-white/5"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <RiStarFill key={j} size={14} className={j < testimonialData[active]?.rating ? 'text-accent-amber' : 'text-text-muted/20'} />
                  ))}
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">"{testimonialData[active]?.content}"</p>
                <div className="flex items-center gap-3">
                  {testimonialData[active]?.avatar
                    ? <img src={testimonialData[active].avatar} alt={testimonialData[active].name} className="w-10 h-10 rounded-full object-cover" />
                    : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center text-white font-bold text-sm">
                        {testimonialData[active]?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )
                  }
                  <div>
                    <p className="text-text-primary font-semibold text-sm">{testimonialData[active]?.name}</p>
                    <p className="text-text-muted text-xs">{testimonialData[active]?.role}</p>
                  </div>
                </div>
              </motion.div>

              <div className="flex justify-center gap-3 mt-6">
                <button onClick={() => setActive((active - 1 + displayCount) % displayCount)} className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
                  <RiArrowLeftSLine size={18} />
                </button>
                {testimonialData.slice(0, displayCount).map((_, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`w-2 h-2 rounded-full transition-all ${i === active ? 'bg-accent-violet w-6' : 'bg-white/20'}`} />
                ))}
                <button onClick={() => setActive((active + 1) % displayCount)} className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
                  <RiArrowRightSLine size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
