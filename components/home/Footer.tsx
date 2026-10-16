import Image from 'next/image';
import Link from 'next/link';
import { CookieSettingsButton } from '../analytics/CookieSettingsButton';
import { getGaMeasurementId } from '../../lib/analytics';

export function Footer() {
  const analyticsEnabled = Boolean(getGaMeasurementId());

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="brand" href="/" aria-label="Emmanuel Growth home">
            <Image className="brand-mark" src="/favicon.svg" alt="" width={36} height={36} />
            <span className="brand-label">EMMANUEL <b>GROWTH</b></span>
          </Link>
          <p>Get found. Convert more enquiries. Get more reviews.</p>
        </div>
        <nav className="footer-col" aria-label="Services">
          <p className="footer-title">Services</p>
          <Link href="/get-found">Get Found</Link>
          <Link href="/convert-enquiries">Convert Enquiries</Link>
          <Link href="/build-trust">Get More Reviews</Link>
        </nav>
        <nav className="footer-col" aria-label="Company">
          <p className="footer-title">Company</p>
          <Link href="/#how-it-works">How It Works</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/#about">About</Link>
        </nav>
        <nav className="footer-col footer-legal" aria-label="Legal information">
          <p className="footer-title">Legal</p>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/cookie-policy">Cookies</Link>
          <Link href="/terms-of-use">Terms</Link>
          {analyticsEnabled ? <CookieSettingsButton /> : null}
        </nav>
      </div>
      <div className="container footer-bottom">
        <small>© {new Date().getFullYear()} Emmanuel Growth</small>
        <small>WhatsApp, Google and Trustpilot are trademarks of their respective owners. Emmanuel Growth is not affiliated with them.</small>
      </div>
    </footer>
  );
}
