import type { Metadata, Viewport } from 'next';
import { Inter, Oswald } from 'next/font/google';
import { AnalyticsConsent } from '../components/analytics/AnalyticsConsent';
import { RouteTransition } from '../components/RouteTransition';
import { getGaMeasurementId, getGoogleSiteVerification } from '../lib/analytics';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
  weight: ['600', '700'],
});

const gaMeasurementId = getGaMeasurementId();
const googleSiteVerification = getGoogleSiteVerification();

export const metadata: Metadata = {
  metadataBase: new URL('https://emmanuelgrowth.com'),
  title: 'Emmanuel Growth | Get Found, Convert Enquiries, Get Reviews',
  description:
    'Emmanuel Growth helps businesses get found online, respond to enquiries faster, follow up with customers and build trust through reviews.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Emmanuel Growth',
    title: 'Get Found. Convert More Enquiries. Get More Reviews.',
    description:
      'Practical marketing systems that help businesses get found online, respond to enquiries faster and stay connected with their customers.',
    // public/og.png is 1672x941 (not 1200x630); the real size is stated so previews crop correctly.
    images: [
      {
        url: '/og.png',
        width: 1672,
        height: 941,
        alt: 'Emmanuel Growth',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Found. Convert More Enquiries. Get More Reviews.',
    description:
      'Practical marketing systems that help businesses get found online, respond to enquiries faster and stay connected with their customers.',
    images: ['/og.png'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple: '/emmanuel-growth-logo-400.png',
  },
  verification: googleSiteVerification
    ? { google: googleSiteVerification }
    : undefined,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${oswald.variable} antialiased`}>
        {children}
        <RouteTransition />
        {gaMeasurementId ? <AnalyticsConsent measurementId={gaMeasurementId} /> : null}
      </body>
    </html>
  );
}
