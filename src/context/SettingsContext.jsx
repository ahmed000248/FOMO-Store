import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeSettings } from '../firebase/firestore';

export const DEFAULT_SETTINGS = {
  storeName:              'LUXE',
  tagline:                'Luxury Fashion Redefined',
  email:                  'luxe@gmail.com',
  phone:                  '+923001234567',
  whatsapp:               '+923001234567',
  address:                'Islamabad, Pakistan',
  instagram:              '',
  facebook:               '',
  tiktok:                 '',
  youtube:                '',
  heroTitle:              'Where Dark\nMeets Refined',
  heroSubtitle:           'Explore pieces that redefine modern luxury — crafted for those who move through the world with intention.',
  announcementText:       'FREE SHIPPING ON ORDERS OVER Rs. 2000',
  currency:               'PKR',
  currencySymbol:         'Rs.',
  codEnabled:             true,
  maintenanceMode:        false,
  shippingFee:            200,
  freeShippingThreshold:  2000,
  logoUrl:                '',
  faviconUrl:             '',
  heroBannerUrl:          '',
  supportEmail:           'support@luxe.com',
  businessHours:          'Mon–Fri, 9am–6pm PKT',
  googleMapsUrl:          '',
};

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS, loading: true });

const isFirebaseConfigured = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return key && key !== 'your_api_key_here' && key.length > 10;
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) { setLoading(false); return; }
    const unsub = subscribeSettings(
      data => {
        setSettings(data ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  // Dynamic favicon
  useEffect(() => {
    if (!settings.faviconUrl) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.faviconUrl;
  }, [settings.faviconUrl]);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
