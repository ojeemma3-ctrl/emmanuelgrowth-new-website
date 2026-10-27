import type { Metadata } from 'next';

// 404 page: a neutral title, noindex, and no canonical or share tags from the home page.
// The visible page is the same as the framework's built-in one (vinext's HTTPAccessErrorFallback), copied here
// without its inline <title> so the metadata below sets the title.
export const metadata: Metadata = {
  title: 'Page not found | Emmanuel Growth',
  description: 'This page could not be found.',
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

const styles = {
  error: { fontFamily: 'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"', height: '100vh', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  desc: { display: 'inline-block' },
  h1: { display: 'inline-block', margin: '0 20px 0 0', padding: '0 23px 0 0', fontSize: 24, fontWeight: 500, verticalAlign: 'top', lineHeight: '49px' },
  h2: { fontSize: 14, fontWeight: 400, lineHeight: '49px', margin: 0 },
} as const;

export default function NotFound() {
  return (
    <div style={styles.error}>
      <div>
        <style dangerouslySetInnerHTML={{ __html: 'body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}' }} />
        <h1 className="next-error-h1" style={styles.h1}>404</h1>
        <div style={styles.desc}>
          <h2 style={styles.h2}>This page could not be found.</h2>
        </div>
      </div>
    </div>
  );
}
