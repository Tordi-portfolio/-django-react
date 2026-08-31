import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/business/')
      .then(setContent)
      .catch(() => setError('Could not load page content — is the API running?'));
  }, []);

  // Scroll to #services / #reviews / #faq when arriving via a hash link.
  useEffect(() => {
    if (!location.hash || !content) return;
    const el = document.querySelector(location.hash);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [location.hash, content]);

  if (error) {
    return <div className="container" style={{ padding: '80px 0' }}>{error}</div>;
  }
  if (!content) {
    return <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--ink-faint)' }}>Loading…</div>;
  }

  const { business, services, steps, reviews, faqs } = content;

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">24/7 emergency dispatch · Licensed &amp; insured</span>
            <h1>
              Your plumbing and
              <br />
              <span className="accent">electrical</span>, handled by one crew.
            </h1>
            <p className="hero-lead">
              {business.name} takes care of everything behind your walls — the pipes that move
              water and the wiring that moves power. Tell us what's wrong, get a real answer from
              a real person, and get it fixed by a licensed, insured, and bonded technician who
              actually shows up when they say they will.
            </p>

            <div className="hero-actions">
              {user ? (
                <Link to={user.is_staff ? '/admin' : '/dashboard'} className="pill-btn solid">
                  Go to my messages
                </Link>
              ) : (
                <>
                  <Link to="/register" className="pill-btn solid">Get a free quote</Link>
                  <a href={`tel:${business.phone}`} className="pill-btn blue-solid">Call {business.phone}</a>
                </>
              )}
            </div>

            <div className="badge-row">
              <div className="badge-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>
                Licensed &amp; bonded
              </div>
              <div className="badge-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>
                Fully insured
              </div>
              <div className="badge-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5" /></svg>
                Upfront pricing
              </div>
            </div>

            <div className="stat-strip">
              <span className="stat-chip"><span className="stars">★★★★★</span></span>
              <span className="stat-chip"><b>{business.followers}+</b> homes &amp; businesses served</span>
              <span className="stat-chip"><b>24/7</b> emergency service</span>
            </div>
          </div>

          <div className="hero-diagram">
            <svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 60 H140 Q160 60 160 80 V140" stroke="#1e6fd9" strokeWidth="9" fill="none" strokeLinecap="round" />
              <circle cx="20" cy="60" r="6" fill="#1e6fd9" />
              <text x="10" y="46" fill="#55657a" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="600">WATER SUPPLY</text>

              <path d="M300 60 H200 V140" stroke="#f5a623" strokeWidth="4" fill="none" strokeDasharray="2 7" strokeLinecap="round" />
              <circle cx="300" cy="60" r="5" fill="#f5a623" />
              <text x="248" y="46" fill="#55657a" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="600">120V POWER</text>

              <circle cx="180" cy="172" r="40" fill="#ffffff" stroke="#1e6fd9" strokeWidth="2" />
              <path d="M180 150c5 6 9 10.5 9 16a9 9 0 1 1-18 0c0-5.5 4-10 9-16z" fill="#1e6fd9" />
              <path d="M187 178l-8 12h5l-6 10 11-14h-5l3-8z" fill="#f5a623" />
              <line x1="160" y1="140" x2="178" y2="152" stroke="#1e6fd9" strokeWidth="7" strokeLinecap="round" />
              <line x1="200" y1="140" x2="182" y2="152" stroke="#f5a623" strokeWidth="4" strokeDasharray="2 7" strokeLinecap="round" />
              <path d="M180 212 V240" stroke="#1e6fd9" strokeWidth="7" strokeLinecap="round" />
              <text x="128" y="256" fill="#55657a" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="600">YOUR HOME, TAKEN CARE OF</text>
            </svg>
            <div className="hero-diagram-caption">One call. Both trades. No juggling contractors.</div>
          </div>
        </div>
      </section>

      <section className="trust-bar">
        <div className="container trust-grid">
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <div><div className="t-title">Licensed &amp; bonded</div><div className="t-sub">Verified on request</div></div>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            <div><div className="t-title">24/7 availability</div><div className="t-sub">Real people answer</div></div>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            <div><div className="t-title">Upfront quotes</div><div className="t-sub">No surprise fees</div></div>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 7 8 .5-6 5.5 2 8-7-4-7 4 2-8-6-5.5L9 9z" /></svg>
            <div><div className="t-title">{business.followers}+ jobs done</div><div className="t-sub">Residential &amp; commercial</div></div>
          </div>
        </div>
      </section>

      <section className="block" id="services">
        <div className="container">
          <div className="block-head">
            <span className="eyebrow">What we fix</span>
            <h2>Two trades, handled by people who know both.</h2>
            <p className="lede">
              Every job is quoted before we start and backed by a crew that's licensed, insured,
              and shows up when we say we will — whether it's a dripping faucet or a full panel swap.
            </p>
          </div>

          <div className="grid-3">
            {services.map((s) => (
              <div className={`card ${s.trade}`} key={s.name}>
                <div className="icon-wrap">
                  {s.trade === 'plumbing' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c-4 0-6-2.5-6-6 0-4 6-11 6-11s6 7 6 11c0 3.5-2 6-6 6z" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                  )}
                </div>
                <span className={`trade-tag ${s.trade}`}>{s.trade}</span>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block alt">
        <div className="container">
          <div className="block-head">
            <span className="eyebrow">How it works</span>
            <h2>From "something's wrong" to fixed, in four steps.</h2>
            <p className="lede">No hold music, no chasing down a callback. Everything happens in your own dashboard.</p>
          </div>

          <div className="steps">
            {steps.map((step, i) => (
              <div className="step" key={step.label}>
                <div className="step-index">{i + 1}</div>
                <h4>{step.label}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block" id="reviews">
        <div className="container">
          <div className="block-head">
            <span className="eyebrow">What customers say</span>
            <h2>Trusted by homeowners and businesses alike.</h2>
            <p className="lede">We'd rather let the people we've worked for do the talking.</p>
          </div>

          <div className="grid-3">
            {reviews.map((r) => (
              <div className="review-card" key={r.name}>
                <span className="stars">★★★★★</span>
                <p>&ldquo;{r.body}&rdquo;</p>
                <div className="who">
                  <div className="review-avatar">{r.initials}</div>
                  <div>
                    <div className="who-name">{r.name}</div>
                    <div className="who-meta">{r.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block alt" id="faq">
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="block-head">
            <span className="eyebrow">Common questions</span>
            <h2>Frequently asked questions</h2>
          </div>

          {faqs.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="block" id="contact">
        <div className="container">
          <div className="cta-band">
            <div>
              <span className="eyebrow">Get in touch</span>
              <h2>Tell Robert what's going on.</h2>
              <p>
                Create a free account, describe the issue, and get replies straight to your own
                dashboard — with an alert on your phone the moment we reply, if you'd like one.
              </p>
            </div>
            <div className="hero-actions" style={{ margin: 0 }}>
              {user ? (
                <Link to={user.is_staff ? '/admin' : '/dashboard'} className="pill-btn solid">Open my dashboard</Link>
              ) : (
                <>
                  <Link to="/register" className="pill-btn solid">Create free account</Link>
                  <Link to="/login" className="pill-btn ghost" style={{ borderColor: '#fff', color: '#fff' }}>I already have one</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
