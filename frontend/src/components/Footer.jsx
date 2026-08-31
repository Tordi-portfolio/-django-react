import { Link } from 'react-router-dom';

const PHONE = '(555) 019-4477';
const NAME = "Robert Evan's Plumbing & Electrician";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="22" fill="#1c2f4d" stroke="#1e6fd9" strokeWidth="2" />
                <path d="M24 10c5 6 9 10.5 9 16a9 9 0 1 1-18 0c0-5.5 4-10 9-16z" fill="#4d94ea" />
                <path d="M27 15 L19 27 H25 L21 35 L31 21 H25 L27 15 Z" fill="#f5a623" />
              </svg>
              <span>{NAME}</span>
            </div>
            <p style={{ maxWidth: '34ch', fontSize: '0.88rem', color: '#9bacc4' }}>
              Family-owned, locally operated, and proud of it. We've spent years earning trust one
              job at a time — one call handles both the pipes and the panel.
            </p>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About us</Link>
            <Link to="/#reviews">Customer reviews</Link>
            <Link to="/#faq">FAQ</Link>
          </div>
          <div>
            <h4>Services</h4>
            <Link to="/#services">Emergency plumbing</Link>
            <Link to="/#services">Drain &amp; sewer</Link>
            <Link to="/#services">Panel upgrades</Link>
            <Link to="/#services">Wiring &amp; rewiring</Link>
          </div>
          <div>
            <h4>Get in touch</h4>
            <a href={`tel:${PHONE}`}>{PHONE}</a>
            <Link to="/#contact">Send a message</Link>
            <p style={{ fontSize: '0.82rem', marginTop: '8px' }}>
              24/7 Emergency Service
              <br />
              Licensed, insured &amp; bonded
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {NAME}. All rights reserved.</span>
          <span>Built to keep the water running and the lights on.</span>
        </div>
      </div>
    </footer>
  );
}
