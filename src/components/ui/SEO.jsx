import { Helmet } from 'react-helmet-async';
import { useSettings } from '../../context/SettingsContext';

export default function SEO({ title, description, keywords, image, url }) {
  const { settings } = useSettings();
  const brandName = settings?.storeName || 'FOMO';
  const siteTitle = `${brandName} | Premium Fashion E-Commerce`;
  const fullTitle = title ? `${title} - ${brandName}` : siteTitle;
  const desc = description || `Discover the latest premium luxury fashion at ${brandName}. Shop our curated collection of high-end garments and accessories.`;
  const defaultImage = image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop';

  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={brandName} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={defaultImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      {url && <meta property="twitter:url" content={url} />}
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={desc} />
      <meta property="twitter:image" content={defaultImage} />
    </Helmet>
  );
}
