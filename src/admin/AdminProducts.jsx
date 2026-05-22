// ─── Admin Products Manager ───────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiAddLine, RiEditLine, RiDeleteBin6Line, RiImageAddLine,
  RiCloseLine, RiCheckLine, RiSearchLine, RiUploadCloud2Line,
} from 'react-icons/ri';
import { subscribeProducts, addProduct, updateProduct, deleteProduct } from '../firebase/firestore';
import { uploadProductImage } from '../firebase/storage';
import { products as localProducts } from '../data/products';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', category: 'T-Shirts', categorySlug: 't-shirts', price: '',
  originalPrice: '', rating: 4.5, reviews: 0, badge: 'New',
  description: '', sizes: ['S','M','L','XL'], colors: ['#1a1a1a'],
  image: '', images: [], isNew: true, isTrending: false, isSale: false,
  stock: 50,
};

const toastStyle = { style: { background: '#1e293b', color: '#f8fafc', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.3)' } };

export default function AdminProducts() {
  const { settings } = useSettings();
  const sym = settings.currencySymbol || 'Rs.';
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form,        setForm]        = useState(emptyForm);
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(null);
  const [uploadPct,   setUploadPct]   = useState(null);
  const [search,      setSearch]      = useState('');
  const [seedLoading, setSeedLoading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const unsub = subscribeProducts(data => { setProducts(data); setLoading(false); });
    return unsub;
  }, []);

  const openAdd  = ()  => { setEditProduct(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => { setEditProduct(p);    setForm({ ...emptyForm, ...p });        setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditProduct(null); setUploadPct(null); };

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const updateNum = k => e => setForm(f => ({ ...f, [k]: Number(e.target.value) }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadPct(0);
      const url = await uploadProductImage(file, pct => setUploadPct(pct));
      setForm(f => ({ ...f, image: url, images: [url, ...f.images.filter(i => i !== f.image)] }));
      setUploadPct(null);
      toast.success('Image uploaded!', toastStyle);
    } catch {
      setUploadPct(null);
      toast.error('Image upload failed', toastStyle);
    }
  };

  const handleGalleryUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading('Uploading angle image...', { id: 'gallery-upload', ...toastStyle });
      const url = await uploadProductImage(file, () => {});
      setForm(f => {
        const next = [...(f.images || [])];
        next[index] = url;
        return { ...f, images: next };
      });
      toast.success('Angle image uploaded!', { id: 'gallery-upload', ...toastStyle });
    } catch {
      toast.error('Upload failed', { id: 'gallery-upload', ...toastStyle });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        price:         Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        rating:        Number(form.rating),
        reviews:       Number(form.reviews),
      };
      if (editProduct) {
        await updateProduct(editProduct.id, data);
        toast.success('Product updated!', toastStyle);
      } else {
        await addProduct(data);
        toast.success('Product added!', toastStyle);
      }
      closeModal();
    } catch (err) {
      toast.error('Save failed: ' + err.message, toastStyle);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      toast.success('Product deleted', toastStyle);
    } catch {
      toast.error('Delete failed', toastStyle);
    }
    setDeleting(null);
  };

  const handleSeed = async () => {
    if (!confirm('Seed Firestore with local product data? This adds demo products.')) return;
    setSeedLoading(true);
    const { seedProducts } = await import('../firebase/firestore');
    try {
      await seedProducts(localProducts);
      toast.success(`${localProducts.length} products seeded!`, toastStyle);
    } catch (err) {
      toast.error('Seed failed: ' + err.message, toastStyle);
    }
    setSeedLoading(false);
  };

  const visible = products.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary">Products</h2>
          <p className="text-text-muted text-sm mt-0.5">{products.length} total products</p>
        </div>
        <div className="flex gap-2">
          {products.length === 0 && (
            <motion.button whileHover={{ scale: 1.02 }} onClick={handleSeed} disabled={seedLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/10 text-text-secondary hover:text-text-primary text-sm disabled:opacity-50">
              {seedLoading ? '...' : '🌱 Seed Data'}
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-violet to-accent-sky text-white text-sm font-semibold">
            <RiAddLine size={18} /> Add Product
          </motion.button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 text-sm" />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider">Product</th>
                <th className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider">Price</th>
                <th className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider hidden md:table-cell">Badge</th>
                <th className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Stock</th>
                <th className="px-5 py-3 text-text-muted text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4">
                    <div className="h-4 shimmer-skeleton rounded-full w-3/4" />
                  </td></tr>
                ))
              ) : visible.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-text-muted">
                  {search ? 'No products match your search' : 'No products yet. Click "Add Product" or seed demo data.'}
                </td></tr>
              ) : visible.map((product) => (
                <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {product.image && (
                        <img src={product.image} alt={product.name} className="w-10 h-12 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <p className="text-text-primary text-sm font-medium truncate max-w-[160px]">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-text-muted text-sm">{product.category}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-text-primary text-sm font-semibold">{sym} {product.price}</p>
                    {product.originalPrice && <p className="text-text-muted text-xs line-through">{sym} {product.originalPrice}</p>}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    {product.badge && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.badge === 'New' ? 'bg-accent-violet/15 text-accent-violet' :
                        product.badge === 'Sale' ? 'bg-accent-rose/15 text-accent-rose' :
                        'bg-accent-amber/15 text-accent-amber'
                      }`}>{product.badge}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {typeof product.stock === 'number' ? (
                      <span className={`text-xs font-semibold ${
                        product.stock === 0 ? 'text-accent-rose' :
                        product.stock <= 5 ? 'text-accent-amber' :
                        'text-accent-emerald'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Low (${product.stock})` : product.stock}
                      </span>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => openEdit(product)}
                        className="p-1.5 rounded-lg glass text-text-muted hover:text-accent-violet transition-colors">
                        <RiEditLine size={15} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(product.id)} disabled={deleting === product.id}
                        className="p-1.5 rounded-lg glass text-text-muted hover:text-accent-rose transition-colors disabled:opacity-40">
                        <RiDeleteBin6Line size={15} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:top-8 lg:bottom-8 lg:w-full lg:max-w-2xl z-50 bg-bg-secondary rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h3 className="text-text-primary font-semibold text-lg">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={closeModal} className="w-8 h-8 rounded-full glass flex items-center justify-center text-text-muted hover:text-text-primary">
                  <RiCloseLine size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
                 {/* Image Upload */}
                 <div className="space-y-4">
                   <div>
                     <label className="text-text-muted text-xs block mb-2">Primary Product Image *</label>
                     <div className="flex gap-3 items-center">
                       {form.image ? (
                         <img src={form.image} alt="" className="w-20 h-24 object-cover rounded-xl border border-white/10" />
                       ) : (
                         <div className="w-20 h-24 rounded-xl border border-dashed border-white/20 flex items-center justify-center bg-bg-surface">
                           <RiImageAddLine className="text-text-muted" size={24} />
                         </div>
                       )}
                       <div>
                         <motion.button type="button" whileHover={{ scale: 1.02 }} onClick={() => fileRef.current?.click()}
                           className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-text-secondary hover:text-text-primary text-sm">
                           <RiUploadCloud2Line size={16} />
                           {uploadPct !== null ? `Uploading ${uploadPct}%...` : 'Upload Image'}
                         </motion.button>
                         {form.image && (
                           <input type="text" value={form.image} onChange={update('image')} placeholder="Or paste URL"
                             className="mt-2 w-full px-3 py-2 bg-bg-surface border border-white/10 rounded-lg text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-accent-violet/50" />
                         )}
                         <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                       </div>
                     </div>
                     {!form.image && (
                       <input type="text" value={form.image} onChange={update('image')} placeholder="Or paste image URL..."
                         className="mt-2 w-full px-3 py-2.5 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-violet/50" />
                     )}
                   </div>

                   {/* Gallery Angle Images (Up to 5) */}
                   <div className="border-t border-white/5 pt-4">
                     <label className="text-text-muted text-xs block mb-2">Gallery Angle Images (Exactly 5 for professional display)</label>
                     <div className="grid grid-cols-5 gap-3">
                       {[0, 1, 2, 3, 4].map(idx => {
                         const imgUrl = form.images?.[idx] || '';
                         const inputId = `gallery-file-${idx}`;
                         return (
                           <div key={idx} className="flex flex-col items-center space-y-1">
                             <div
                               onClick={() => document.getElementById(inputId)?.click()}
                               className="w-full aspect-[4/5] rounded-xl border border-dashed border-white/10 hover:border-accent-violet/40 cursor-pointer overflow-hidden flex items-center justify-center bg-bg-surface relative group"
                             >
                               {imgUrl ? (
                                 <>
                                   <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                     <RiUploadCloud2Line className="text-white" size={16} />
                                   </div>
                                 </>
                               ) : (
                                 <RiImageAddLine className="text-text-muted group-hover:text-text-primary transition-colors" size={20} />
                               )}
                               <input
                                 id={inputId}
                                 type="file"
                                 accept="image/*"
                                 onChange={(e) => handleGalleryUpload(e, idx)}
                                 className="hidden"
                               />
                             </div>
                             {imgUrl && (
                               <button
                                 type="button"
                                 onClick={() => {
                                   setForm(f => {
                                     const next = [...(f.images || [])];
                                     next[idx] = '';
                                     // Filter out empty spots if they are trailing, but keep array shape
                                     return { ...f, images: next };
                                   });
                                 }}
                                 className="text-[10px] text-accent-rose hover:underline"
                               >
                                 Remove
                               </button>
                             )}
                           </div>
                         );
                       })}
                     </div>
                     {/* Text inputs for gallery URLs if they prefer pasting link */}
                     <div className="mt-3 space-y-2">
                       <p className="text-text-muted text-[10px]">Or paste direct links for specific angles:</p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                         {[0, 1, 2, 3, 4].map(idx => (
                           <input
                             key={idx}
                             type="text"
                             value={form.images?.[idx] || ''}
                             onChange={(e) => {
                               const val = e.target.value;
                               setForm(f => {
                                 const next = [...(f.images || [])];
                                 next[idx] = val;
                                 return { ...f, images: next };
                               });
                             }}
                             placeholder={`Angle ${idx + 1} Image URL`}
                             className="px-3 py-2 bg-bg-surface border border-white/10 rounded-lg text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-accent-violet/50"
                           />
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>

                {/* Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-text-muted text-xs block mb-1.5">Product Name *</label>
                    <input type="text" value={form.name} onChange={update('name')} required
                      className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 text-sm" />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1.5">Price ($) *</label>
                    <input type="number" value={form.price} onChange={updateNum('price')} required min={0}
                      className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-violet/50 text-sm" />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1.5">Original Price ($)</label>
                    <input type="number" value={form.originalPrice} onChange={updateNum('originalPrice')} min={0}
                      className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-violet/50 text-sm" />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, categorySlug: e.target.value.toLowerCase().replace(/\s/g,'-') }))}
                      className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-violet/50 text-sm">
                      {['T-Shirts','Shirts','Bottoms','Outerwear','Knitwear','Activewear','Tops'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1.5">Badge</label>
                    <select value={form.badge} onChange={update('badge')}
                      className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-violet/50 text-sm">
                      <option value="">None</option>
                      {['New','Sale','Trending'].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1.5">Rating</label>
                    <input type="number" value={form.rating} onChange={updateNum('rating')} min={0} max={5} step={0.1}
                      className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-violet/50 text-sm" />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1.5">Review Count</label>
                    <input type="number" value={form.reviews} onChange={updateNum('reviews')} min={0}
                      className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-violet/50 text-sm" />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1.5">Stock Quantity</label>
                    <input type="number" value={form.stock ?? 50} onChange={updateNum('stock')} min={0}
                      className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-violet/50 text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-text-muted text-xs block mb-1.5">Description</label>
                    <textarea value={form.description} onChange={update('description')} rows={3}
                      className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-accent-violet/50 text-sm resize-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-text-muted text-xs block mb-1.5">Sizes (comma-separated)</label>
                    <input type="text" value={Array.isArray(form.sizes) ? form.sizes.join(',') : form.sizes}
                      onChange={e => setForm(f => ({ ...f, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                      placeholder="XS,S,M,L,XL"
                      className="w-full px-4 py-3 bg-bg-surface border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 text-sm" />
                  </div>
                </div>

                {/* Flags */}
                <div className="flex gap-4">
                  {[['isNew','New'],['isTrending','Trending'],['isSale','On Sale']].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                        className={`w-10 h-5 rounded-full transition-all relative ${form[key] ? 'bg-accent-violet' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-text-secondary text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </form>

              <div className="px-6 py-4 border-t border-white/5 flex gap-3">
                <button onClick={closeModal} className="flex-1 py-3 rounded-2xl glass border border-white/10 text-text-secondary hover:text-text-primary text-sm">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-accent-violet to-accent-sky text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <RiCheckLine size={16} />}
                  {editProduct ? 'Save Changes' : 'Add Product'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
