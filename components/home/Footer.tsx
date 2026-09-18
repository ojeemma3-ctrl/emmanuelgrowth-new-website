export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <a className="brand" href="#top">EMMANUEL <span>GROWTH</span></a>
        <p>Get found. Convert more enquiries. Stay connected.</p>
        <nav aria-label="Footer navigation"><a href="#services">Services</a><a href="#how-it-works">How It Works</a><a href="#about">About</a></nav>
        <small>© {new Date().getFullYear()} Emmanuel Growth</small>
      </div>
    </footer>
  );
}
