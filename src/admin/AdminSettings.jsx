// ─── Admin Settings Panel ─────────────────────────────────────────────────────
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiSettings3Line, RiStore2Line, RiInstagramLine, RiFacebookLine,
  RiTiktokLine, RiYoutubeLine, RiHomeSmileLine, RiImageLine,
  RiBriefcaseLine, RiCustomerService2Line, RiSaveLine, RiUpload2Line,
  RiDeleteBinLine, RiCheckLine, RiGlobalLine, RiWhatsappLine,
  RiPhoneLine, RiMailLine, RiMapPinLine, RiTimeLine, RiExternalLinkLine,
  RiMoneyDollarCircleLine, RiTruckLine, RiToggleLine, RiToggleFill,
  RiAlertLine, RiLoader4Line, RiImageEditLine, RiCloseCircleLine,
  RiInformationLine, RiPaintLine,
} from 'react-icons/ri';
import { updateSettings } from '../firebase/firestore';
import { uploadSettingsImage } from '../firebase/storage';
import { useSettings, DEFAULT_SETTINGS } from '../context/SettingsContext';

// ─── Shared field styles ──────────────────────────────────────────────────────
const inputCls = 'w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 transition-colors text-sm';
const labelCls = 'block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2';

// ─── Reusable sub-components ─────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className="text-text-muted text-xs mt-1.5">{hint}</p>}
    </div>
  );
}

function Toggle({ value, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between p-4 bg-bg-surface rounded-xl border border-white/8">
      <div className="min-w-0 mr-4">
        <p className="text-text-primary text-sm font-medium">{label}</p>
        {description && <p className="text-text-muted text-xs mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`flex-shrink-0 transition-colors ${value ? 'text-accent-violet' : 'text-text-muted'}`}
      >
        {value ? <RiToggleFill size={36} /> : <RiToggleLine size={36} />}
      </button>
    </div>
  );
}

function SaveButton({ loading, saved, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved
        ? 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30'
        : 'bg-gradient-to-r from-accent-violet to-accent-sky text-white shadow-glow-violet'
        } disabled:opacity-60`}
    >
      {loading
        ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}><RiLoader4Line size={16} /></motion.span> Saving…</>
        : saved
          ? <><RiCheckLine size={16} /> Saved!</>
          : <><RiSaveLine size={16} /> Save Changes</>}
    </motion.button>
  );
}

// ─── Image Upload component ───────────────────────────────────────────────────
function ImageUpload({ label, value, onChange, type = 'logo', hint }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadSettingsImage(file, type, setProgress);
      onChange(url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onChange, type]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden
          ${dragging ? 'border-accent-violet/60 bg-accent-violet/5' : 'border-white/10 hover:border-accent-violet/30 bg-bg-surface'}
          ${uploading ? 'pointer-events-none' : ''}`}
        style={{ minHeight: type === 'hero' ? 160 : 120 }}
      >
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt={label}
              className={`w-full object-cover ${type === 'hero' ? 'h-40' : type === 'favicon' ? 'h-20 object-contain p-4' : 'h-28 object-contain p-3'}`}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <span className="text-white text-sm font-medium flex items-center gap-1.5">
                <RiImageEditLine size={16} /> Click to replace
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-accent-rose/80 transition-colors"
            >
              <RiCloseCircleLine size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            {uploading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                  <RiLoader4Line size={28} className="text-accent-violet mb-3" />
                </motion.div>
                <p className="text-text-secondary text-sm mb-2">Uploading… {progress}%</p>
                <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-accent-violet rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </>
            ) : (
              <>
                <RiUpload2Line size={28} className="text-text-muted mb-3" />
                <p className="text-text-secondary text-sm">
                  <span className="text-accent-violet font-semibold">Click to upload</span> or drag & drop
                </p>
                <p className="text-text-muted text-xs mt-1">WebP, PNG, JPG — auto-compressed</p>
              </>
            )}
          </div>
        )}
        {uploading && !value && (
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/5">
            <motion.div className="h-full bg-accent-violet" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
      {hint && <p className="text-text-muted text-xs mt-1.5">{hint}</p>}
    </div>
  );
}

// ─── Section container ────────────────────────────────────────────────────────
function Section({ title, description, icon: Icon, children, onSave, saving, saved, accent = '#8b5cf6' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}>
            <Icon size={20} style={{ color: accent }} />
          </div>
          <div>
            <h2 className="text-text-primary font-semibold text-lg">{title}</h2>
            {description && <p className="text-text-muted text-sm mt-0.5">{description}</p>}
          </div>
        </div>
        <SaveButton loading={saving} saved={saved} onClick={onSave} />
      </div>
      <div className="space-y-5">{children}</div>
    </motion.div>
  );
}

// ─── Nav Tab ──────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'general', label: 'General', icon: RiStore2Line, accent: '#8b5cf6' },
  { id: 'social', label: 'Social', icon: RiInstagramLine, accent: '#ec4899' },
  { id: 'homepage', label: 'Homepage', icon: RiHomeSmileLine, accent: '#38bdf8' },
  { id: 'branding', label: 'Branding', icon: RiPaintLine, accent: '#f59e0b' },
  { id: 'business', label: 'Business', icon: RiBriefcaseLine, accent: '#10b981' },
  { id: 'contact', label: 'Contact', icon: RiCustomerService2Line, accent: '#f97316' },
];

// ─── useSectionSave helper ────────────────────────────────────────────────────
function useSectionSave(fields) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateSettings(fields);
      setSaved(true);
      toast.success('Settings saved successfully');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [fields]);

  return { saving, saved, save };
}

// ─── GENERAL SECTION ─────────────────────────────────────────────────────────
function GeneralSection({ initial }) {
  const [form, setForm] = useState({
    storeName: initial.storeName,
    tagline: initial.tagline,
    email: initial.email,
    phone: initial.phone,
    whatsapp: initial.whatsapp,
    address: initial.address,
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const { saving, saved, save } = useSectionSave(form);

  return (
    <Section title="General" description="Core store information visible across the site" icon={RiStore2Line} onSave={save} saving={saving} saved={saved}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Store Name" hint="Displayed in navbar, browser tab and SEO">
          <input className={inputCls} value={form.storeName} onChange={set('storeName')} placeholder="LUXE" />
        </Field>
        <Field label="Tagline" hint="Short brand slogan shown in footer">
          <input className={inputCls} value={form.tagline} onChange={set('tagline')} placeholder="Luxury Fashion Redefined" />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Store Email">
          <div className="relative">
            <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input type="email" className={`${inputCls} pl-10`} value={form.email} onChange={set('email')} placeholder="luxe@gmail.com" />
          </div>
        </Field>
        <Field label="Phone Number">
          <div className="relative">
            <RiPhoneLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input type="tel" className={`${inputCls} pl-10`} value={form.phone} onChange={set('phone')} placeholder="+923001234567" />
          </div>
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="WhatsApp Number" hint="Used for customer WhatsApp chat buttons">
          <div className="relative">
            <RiWhatsappLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input type="tel" className={`${inputCls} pl-10`} value={form.whatsapp} onChange={set('whatsapp')} placeholder="+923001234567" />
          </div>
        </Field>
        <Field label="Store Address">
          <div className="relative">
            <RiMapPinLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input className={`${inputCls} pl-10`} value={form.address} onChange={set('address')} placeholder="Islamabad, Pakistan" />
          </div>
        </Field>
      </div>
    </Section>
  );
}

// ─── SOCIAL SECTION ───────────────────────────────────────────────────────────
function SocialSection({ initial }) {
  const [form, setForm] = useState({
    instagram: initial.instagram,
    facebook: initial.facebook,
    tiktok: initial.tiktok,
    youtube: initial.youtube,
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const { saving, saved, save } = useSectionSave(form);

  const socials = [
    { key: 'instagram', Icon: RiInstagramLine, label: 'Instagram', color: '#e1306c', placeholder: 'https://instagram.com/luxe' },
    { key: 'facebook', Icon: RiFacebookLine, label: 'Facebook', color: '#1877f2', placeholder: 'https://facebook.com/luxe' },
    { key: 'tiktok', Icon: RiTiktokLine, label: 'TikTok', color: '#010101', placeholder: 'https://tiktok.com/@luxe' },
    { key: 'youtube', Icon: RiYoutubeLine, label: 'YouTube', color: '#ff0000', placeholder: 'https://youtube.com/c/luxe' },
  ];

  return (
    <Section title="Social Media" description="Links shown in the footer and social share features" icon={RiInstagramLine} accent="#ec4899" onSave={save} saving={saving} saved={saved}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {socials.map(({ key, Icon, label, color, placeholder }) => (
          <Field key={key} label={label}>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <Icon size={16} style={{ color }} />
              </div>
              <input
                type="url"
                className={`${inputCls} pl-10`}
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
              />
            </div>
            {form[key] && (
              <a href={form[key]} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-accent-violet text-xs mt-1.5 hover:text-accent-sky transition-colors">
                <RiExternalLinkLine size={12} /> Preview link ↗
              </a>
            )}
          </Field>
        ))}
      </div>
    </Section>
  );
}

// ─── HOMEPAGE SECTION ─────────────────────────────────────────────────────────
function HomepageSection({ initial }) {
  const [form, setForm] = useState({
    heroTitle: initial.heroTitle,
    heroSubtitle: initial.heroSubtitle,
    announcementText: initial.announcementText,
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const { saving, saved, save } = useSectionSave(form);

  return (
    <Section title="Homepage" description="Text content for the hero and announcement bar" icon={RiHomeSmileLine} accent="#38bdf8" onSave={save} saving={saving} saved={saved}>
      <Field label="Announcement Bar Text" hint="Shown in the top promo strip across the site">
        <input className={inputCls} value={form.announcementText} onChange={set('announcementText')} placeholder="FREE SHIPPING ON ORDERS OVER $200" />
      </Field>
      <Field label="Hero Title" hint="Line breaks are supported with \\n (e.g. Where Dark\\nMeets Refined)">
        <input className={inputCls} value={form.heroTitle} onChange={set('heroTitle')} placeholder="Where Dark\nMeets Refined" />
      </Field>
      <Field label="Hero Subtitle">
        <textarea rows={3} className={`${inputCls} resize-none`} value={form.heroSubtitle} onChange={set('heroSubtitle')}
          placeholder="Explore pieces that redefine modern luxury…" />
      </Field>
      {/* Live preview */}
      <div className="glass rounded-2xl p-5 border border-white/5">
        <p className="text-text-muted text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-1.5"><RiInformationLine size={12} /> Preview</p>
        <div className="bg-bg-primary rounded-xl p-4 border border-white/5">
          <div className="text-xs text-center py-1 mb-3 text-text-muted border border-white/5 rounded-lg bg-white/3">{form.announcementText || '—'}</div>
          <p className="font-display text-2xl font-bold text-text-primary leading-tight mb-2">
            {form.heroTitle?.split(/\\n|\n/).map((line, i) => (
              <span key={i} className={`block ${i === 1 ? 'gradient-text italic' : ''}`}>{line || '—'}</span>
            ))}
          </p>
          <p className="text-text-muted text-xs leading-relaxed">{form.heroSubtitle || '—'}</p>
        </div>
      </div>
    </Section>
  );
}

// ─── BRANDING SECTION ─────────────────────────────────────────────────────────
function BrandingSection({ initial }) {
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(initial.faviconUrl || '');
  const [heroBannerUrl, setHeroBannerUrl] = useState(initial.heroBannerUrl || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true); setSaved(false);
    try {
      await updateSettings({ logoUrl, faviconUrl, heroBannerUrl });
      setSaved(true);
      toast.success('Branding saved');
      setTimeout(() => setSaved(false), 3000);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <Section title="Branding" description="Upload your logo, favicon and hero banner image" icon={RiPaintLine} accent="#f59e0b" onSave={save} saving={saving} saved={saved}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUpload
          label="Store Logo"
          value={logoUrl}
          onChange={setLogoUrl}
          type="logo"
          hint="Recommended: transparent PNG or SVG — max 400px wide"
        />
        <ImageUpload
          label="Favicon"
          value={faviconUrl}
          onChange={setFaviconUrl}
          type="favicon"
          hint="Square image — displayed as browser tab icon (64×64)"
        />
      </div>
      <ImageUpload
        label="Hero Banner Image"
        value={heroBannerUrl}
        onChange={setHeroBannerUrl}
        type="hero"
        hint="Recommended: wide landscape photo — max 1200px wide (replaces first hero slide image)"
      />
    </Section>
  );
}

// ─── BUSINESS SECTION ─────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: 'PKR', symbol: 'Rs.', label: 'Pakistani Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'SAR', symbol: 'ر.س', label: 'Saudi Riyal' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
];

function BusinessSection({ initial }) {
  const [form, setForm] = useState({
    currency: initial.currency,
    currencySymbol: initial.currencySymbol,
    codEnabled: initial.codEnabled,
    maintenanceMode: initial.maintenanceMode,
    shippingFee: initial.shippingFee,
    freeShippingThreshold: initial.freeShippingThreshold,
  });
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const { saving, saved, save } = useSectionSave(form);

  const onCurrencyChange = (e) => {
    const found = CURRENCIES.find(c => c.code === e.target.value);
    if (found) setForm(f => ({ ...f, currency: found.code, currencySymbol: found.symbol }));
  };

  return (
    <Section title="Business" description="Operational settings, currency and shipping rules" icon={RiBriefcaseLine} accent="#10b981" onSave={save} saving={saving} saved={saved}>
      {/* Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Currency" hint="Affects all price displays site-wide">
          <div className="relative">
            <RiMoneyDollarCircleLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <select className={`${inputCls} pl-10 appearance-none`} value={form.currency} onChange={onCurrencyChange}>
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.label}</option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="Currency Symbol (manual override)">
          <input className={inputCls} value={form.currencySymbol} onChange={(e) => set('currencySymbol')(e.target.value)} placeholder="₨" />
        </Field>
      </div>
      {/* Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Shipping Fee" hint={`Flat fee charged at checkout (${form.currencySymbol})`}>
          <div className="relative">
            <RiTruckLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input type="number" min="0" className={`${inputCls} pl-10`} value={form.shippingFee}
              onChange={(e) => set('shippingFee')(Number(e.target.value))} placeholder="200" />
          </div>
        </Field>
        <Field label="Free Shipping Threshold" hint={`Orders above this amount get free shipping (${form.currencySymbol})`}>
          <div className="relative">
            <RiGlobalLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input type="number" min="0" className={`${inputCls} pl-10`} value={form.freeShippingThreshold}
              onChange={(e) => set('freeShippingThreshold')(Number(e.target.value))} placeholder="2000" />
          </div>
        </Field>
      </div>
      {/* Toggles */}
      <div className="space-y-3">
        <Toggle
          value={form.codEnabled}
          onChange={set('codEnabled')}
          label="Cash on Delivery"
          description="Allow customers to pay with cash when their order arrives"
        />
        <Toggle
          value={form.maintenanceMode}
          onChange={set('maintenanceMode')}
          label="Maintenance Mode"
          description="Temporarily hide the store — only admins can access"
        />
        {form.maintenanceMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-xs">
            <RiAlertLine size={16} className="flex-shrink-0 mt-0.5" />
            <span>Maintenance mode is ON. Customers will see a maintenance page. Only logged-in admins can browse the store.</span>
          </motion.div>
        )}
      </div>
    </Section>
  );
}

// ─── CONTACT SECTION ──────────────────────────────────────────────────────────
function ContactSection({ initial }) {
  const [form, setForm] = useState({
    supportEmail: initial.supportEmail,
    businessHours: initial.businessHours,
    googleMapsUrl: initial.googleMapsUrl,
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const { saving, saved, save } = useSectionSave(form);

  return (
    <Section title="Contact" description="Customer support details shown on the Contact page" icon={RiCustomerService2Line} accent="#f97316" onSave={save} saving={saving} saved={saved}>
      <Field label="Support Email">
        <div className="relative">
          <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input type="email" className={`${inputCls} pl-10`} value={form.supportEmail} onChange={set('supportEmail')} placeholder="support@luxe.com" />
        </div>
      </Field>
      <Field label="Business Hours">
        <div className="relative">
          <RiTimeLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input className={`${inputCls} pl-10`} value={form.businessHours} onChange={set('businessHours')} placeholder="Mon–Fri, 9am–6pm PKT" />
        </div>
      </Field>
      <Field label="Google Maps Embed URL" hint="Paste the full Google Maps embed iframe src URL">
        <div className="relative">
          <RiMapPinLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input type="url" className={`${inputCls} pl-10`} value={form.googleMapsUrl} onChange={set('googleMapsUrl')} placeholder="https://maps.google.com/..." />
        </div>
      </Field>
      {form.googleMapsUrl && (
        <div className="rounded-xl overflow-hidden border border-white/10 h-48">
          <iframe src={form.googleMapsUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Store location" />
        </div>
      )}
    </Section>
  );
}

// ─── Main AdminSettings page ──────────────────────────────────────────────────
export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState('general');
  const { settings, loading } = useSettings();

  // Use a stable key that only changes when Firestore data actually arrives
  // (not on every render), so section forms reinitialize once with real values.
  const settingsKey = loading ? 'defaults' : 'loaded';

  const sectionMap = {
    general: <GeneralSection key={settingsKey} initial={settings} />,
    social: <SocialSection key={settingsKey} initial={settings} />,
    homepage: <HomepageSection key={settingsKey} initial={settings} />,
    branding: <BrandingSection key={settingsKey} initial={settings} />,
    business: <BusinessSection key={settingsKey} initial={settings} />,
    contact: <ContactSection key={settingsKey} initial={settings} />,
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-accent-violet/15 border border-accent-violet/20 flex items-center justify-center">
            <RiSettings3Line size={20} className="text-accent-violet" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-text-primary font-display font-bold text-2xl">Website Settings</h1>
              {loading && (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="opacity-50">
                  <RiLoader4Line size={16} className="text-accent-violet" />
                </motion.div>
              )}
            </div>
            <p className="text-text-muted text-sm">Manage your store</p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <aside className="lg:w-52 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {SECTIONS.map(({ id, label, icon: Icon, accent }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 lg:flex-shrink lg:w-full ${active
                    ? 'bg-bg-surface text-text-primary border border-white/8 shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/4'
                    }`}
                >
                  <Icon size={16} style={active ? { color: accent } : {}} />
                  {label}
                  {active && <motion.div layoutId="settings-pill" className="ml-auto w-1.5 h-1.5 rounded-full hidden lg:block" style={{ background: accent }} />}
                </button>
              );
            })}
          </nav>

          {/* Last updated */}
          {settings.updatedAt && (
            <div className="hidden lg:block mt-6 p-3 rounded-xl bg-bg-surface border border-white/5 text-center">
              <p className="text-text-muted text-xs">Last saved</p>
              <p className="text-text-secondary text-xs mt-0.5 font-mono">
                {settings.updatedAt?.toDate
                  ? settings.updatedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </p>
            </div>
          )}
        </aside>

        {/* Section content */}
        <div className="flex-1 glass rounded-2xl p-6 border border-white/5 min-h-96">
          <AnimatePresence mode="wait">
            {sectionMap[activeSection]}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
