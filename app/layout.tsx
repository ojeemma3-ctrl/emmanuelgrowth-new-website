import type { Metadata } from 'next';
import { Inter, Oswald } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Emmanuel Growth — Get Found. Convert More. Stay Connected.',
  description: 'Practical marketing systems that help businesses get found online, respond to leads faster and stay connected with their customers.',
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
      </body>
    </html>
  );
}
