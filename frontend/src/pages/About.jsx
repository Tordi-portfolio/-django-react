import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function About() {
  const { user } = useAuth();

  return (
    <section className="block" style={{ paddingTop: '56px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <span className="eyebrow">About the company</span>
        <h1 style={{ fontSize: 'clamp(2rem,4vw,2.8rem)' }}>Residential. Commercial. Reliable, either way.</h1>
        <p className="lede">
          Robert Evan's Plumbing &amp; Electrician was built around a simple idea: the pipes that
          move water through your home and the wiring that moves power through it are both part
          of the same system, and you shouldn't need two different contractors — with two
          different schedules and two different invoices — to keep either one working.
        </p>
        <p>
          We're a licensed, insured, and bonded plumbing and electrical company serving both
          residential and commercial customers. Whether it's a 2 a.m. burst pipe, a breaker panel
          that's finally given up, or a full remodel that touches both trades at once, one crew
          and one point of contact sees the job through from the first message to the final
          walkthrough.
        </p>
        <p>
          Every job starts with an honest, written quote — before any work begins, not after. We
          explain what's wrong, what it will cost to fix, and what your options are, in plain
          language. No pressure, no upsells you didn't ask for, and no invoice that looks nothing
          like the estimate you agreed to.
        </p>

        <div className="grid-2" style={{ marginTop: '40px' }}>
          <div className="card">
            <div className="icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c-4 0-6-2.5-6-6 0-4 6-11 6-11s6 7 6 11c0 3.5-2 6-6 6z" /></svg>
            </div>
            <span className="trade-tag plumbing">Plumbing crew</span>
            <h3>Water, drains &amp; fixtures</h3>
            <p>
              Emergency repairs, water heater and fixture installations, drain and sewer work, and
              ongoing maintenance plans for homes and businesses that would rather prevent a
              problem than pay to fix one.
            </p>
          </div>
          <div className="card electrical">
            <div className="icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <span className="trade-tag electrical">Electrical crew</span>
            <h3>Power, panels &amp; wiring</h3>
            <p>
              Panel upgrades, new circuits and rewiring, and regular inspections that catch the
              kind of small electrical issues that turn into expensive — or dangerous — problems
              if they're left alone.
            </p>
          </div>
        </div>

        <div className="block-head left" style={{ marginTop: '56px' }}>
          <span className="eyebrow">Why people choose us</span>
          <h2>What working with us actually looks like</h2>
        </div>

        <div className="grid-3">
          <div className="card">
            <div className="icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg></div>
            <h3>Straight answers</h3>
            <p>You get a real assessment and a real price, in writing, before anyone picks up a tool.</p>
          </div>
          <div className="card">
            <div className="icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg></div>
            <h3>Shows up on time</h3>
            <p>We give you a window and we keep it — and we message you if anything changes, before you have to ask.</p>
          </div>
          <div className="card">
            <div className="icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
            <h3>Backed by our work</h3>
            <p>Every installation and repair is covered by our workmanship guarantee — if something's not right, we come back and make it right.</p>
          </div>
        </div>

        <div className="cta-band" style={{ marginTop: '56px' }}>
          <div>
            <span className="eyebrow">Ready when you are</span>
            <h2 style={{ fontSize: '1.5rem' }}>Have a job for us?</h2>
            <p>Send the details through your dashboard and Robert will reply personally with a plan.</p>
          </div>
          <div className="hero-actions" style={{ margin: 0 }}>
            {user ? (
              <Link to={user.is_staff ? '/admin' : '/dashboard'} className="pill-btn solid">Open dashboard</Link>
            ) : (
              <Link to="/register" className="pill-btn solid">Get started</Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
