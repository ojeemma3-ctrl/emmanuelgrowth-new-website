import Image from 'next/image';
import Link from 'next/link';
import { CookieSettingsButton } from '../analytics/CookieSettingsButton';
import { getGaMeasurementId } from '../../lib/analytics';

export function Footer() {
  const analyticsEnabled = Boolean(getGaMeasurementId());

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <Link className="brand" href="/" aria-label="Emmanuel Growth home">
          <Image className="brand-mark" src="/favicon.svg" alt="" width={36} height={36} />
          <span className="brand-label">EMMANUEL <b>GROWTH</b></span>
        </Link>
        <p>Get found. Convert more enquiries. Stay connected.</p>
        <div className="footer-links">
          <nav aria-label="Footer navigation"><Link href="/#services">Services</Link><Link href="/#how-it-works">How It Works</Link><Link href="/#about">About</Link></nav>
          <nav className="footer-legal" aria-label="Legal information"><a href="/privacy-policy">Privacy</a><a href="/cookie-policy">Cookies</a><a href="/terms-of-use">Terms</a>{analyticsEnabled ? <CookieSettingsButton /> : null}</nav>
        </div>
        <small>© {new Date().getFullYear()} Emmanuel Growth</small>
      </div>
    </footer>
  );
}
