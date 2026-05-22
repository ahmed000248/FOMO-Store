import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiTwitterXLine, RiFacebookLine, RiInstagramLine, RiYoutubeLine,
  RiArrowRightLine, RiTiktokLine, RiLoader4Line, RiCheckLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';
import { subscribeNewsletter } from '../../firebase/firestore';

const footerLinks = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Contact', href: '/contact' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Delivery Details', href: '#' },
    { label: 'Returns', href: '#' },
    { label: 'Track Order', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Accessibility', href: '#' },
  ],
};

export default function Footer() {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const [subDone, setSubDone] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubLoading(true);
    try {
      await subscribeNewsletter(email.trim());
      setSubDone(true);
      setEmail('');
      toast.success('Subscribed! You\'re on the list.');
      setTimeout(() => setSubDone(false), 4000);
    } catch {
      toast.error('Subscription failed. Please try again.');
    } finally {
      setSubLoading(false);
    }
  };

  const socials = [
    { Icon: RiInstagramLine, href: settings.instagram, label: 'Instagram' },
    { Icon: RiFacebookLine,  href: settings.facebook,  label: 'Facebook'  },
    { Icon: RiTiktokLine,    href: settings.tiktok,    label: 'TikTok'    },
    { Icon: RiYoutubeLine,   href: settings.youtube,   label: 'YouTube'   },
  ].filter(s => s.href);

  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/5 bg-bg-secondary overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-40 bg-gradient-to-b from-accent-violet/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.storeName} className="h-8 w-auto object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center">
                    <span className="text-white font-display font-bold text-sm">{(settings.storeName || 'L')[0]}</span>
                  </div>
                  <span className="font-display text-xl font-bold gradient-text">{settings.storeName || 'LUXE'}</span>
                </>
              )}
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-6 max-w-xs">
              {settings.tagline || 'Crafting premium fashion for the modern individual.'}
            </p>
            <div className="flex gap-3">
              {socials.length > 0 ? socials.map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-9 h-9 rounded-full glass flex items-center justify-center text-text-muted hover:text-accent-violet transition-colors"
                >
                  <Icon size={16} />
                </motion.a>
              )) : (
                [RiInstagramLine, RiFacebookLine, RiYoutubeLine].map((Icon, i) => (
                  <motion.a key={i} href="#" whileHover={{ scale: 1.1, y: -2 }}
                    className="w-9 h-9 rounded-full glass flex items-center justify-center text-text-muted hover:text-accent-violet transition-colors">
                    <Icon size={16} />
                  </motion.a>
                ))
              )}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-text-primary font-semibold text-sm tracking-widest uppercase mb-6">{section}</h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-text-muted hover:text-text-primary text-sm transition-colors hover:translate-x-1 inline-block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h3 className="text-text-primary font-semibold text-sm tracking-widest uppercase mb-6">Newsletter</h3>
            <p className="text-text-muted text-sm mb-4">Get early access to new drops and exclusive offers.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={subLoading || subDone}
                className="flex-1 bg-bg-surface border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-violet/50 transition-colors disabled:opacity-60"
              />
              <motion.button
                type="submit"
                disabled={subLoading || subDone}
                whileHover={{ scale: subLoading || subDone ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-xl text-white transition-colors ${subDone ? 'bg-accent-emerald' : 'bg-gradient-to-r from-accent-violet to-accent-sky'} disabled:opacity-70`}
              >
                {subLoading
                  ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} className="block"><RiLoader4Line size={18} /></motion.span>
                  : subDone
                    ? <RiCheckLine size={18} />
                    : <RiArrowRightLine size={18} />}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">© {year} {settings.storeName || 'LUXE'}. All rights reserved. Crafted with intention.</p>
          
          <div className="flex items-center gap-3">
            <span className="text-text-muted text-xs">We accept</span>
            <div className="flex gap-2 items-center">
              {['VISA', 'MC', 'PP', 'GPay'].map((brand) => (
                <span key={brand} className="text-xs font-mono text-text-muted glass px-2 py-1 rounded-md">{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
