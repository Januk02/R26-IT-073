import StudiFyxLogo from '../components/StudiFyxLogo';

const Landing = ({ onNavigateToLogin, onNavigateToRegister }) => {
  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Main navigation">
        <div className="landing-brand">
          <StudiFyxLogo size="w-12 h-12" />
          <span>StudiFyx</span>
        </div>
        <div className="landing-nav-actions">
          <button type="button" className="landing-text-button" onClick={onNavigateToLogin}>
            Sign in
          </button>
          <button type="button" className="landing-small-button" onClick={onNavigateToRegister}>
            Join free
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-kicker">A better way to move forward</p>
          <h1>Learn with purpose. <span>Grow with people.</span></h1>
          <p className="landing-intro">
            StudiFyx connects ambitious students with mentors who make the next step feel clearer, more practical, and more achievable.
          </p>
          <div className="landing-cta-group">
            <button type="button" className="landing-primary-button" onClick={onNavigateToRegister}>
              Start your journey <span aria-hidden="true">-&gt;</span>
            </button>
            <button type="button" className="landing-secondary-button" onClick={onNavigateToLogin}>
              I already have an account
            </button>
          </div>
          <p className="landing-note"><span className="landing-status-dot" /> Built for students and mentors who keep showing up.</p>
        </div>

        <div className="landing-hero-art" aria-label="StudiFyx mentorship overview">
          <div className="landing-orbit landing-orbit-one" />
          <div className="landing-orbit landing-orbit-two" />
          <div className="landing-art-card landing-art-card-main">
            <span className="landing-card-label">YOUR NEXT CHAPTER</span>
            <strong>Small steps.<br />Real momentum.</strong>
            <div className="landing-progress"><span /></div>
            <p>Learning plan · 72% on track</p>
          </div>
          <div className="landing-art-card landing-art-card-float landing-art-card-match">
            <span className="landing-avatar">AK</span>
            <div><strong>Great match</strong><p>Alex · Product design</p></div>
            <span className="landing-check">&#10003;</span>
          </div>
          <div className="landing-art-card landing-art-card-float landing-art-card-quote">
            <span className="landing-quote-mark">“</span>
            <p>The right conversation<br />can change everything.</p>
          </div>
        </div>
      </section>

      <section className="landing-steps" aria-label="How StudiFyx works">
        <div className="landing-section-heading"><span>01</span><h2>Make progress feel possible.</h2></div>
        <div className="landing-step-grid">
          <article><span>01</span><h3>Know your direction</h3><p>Turn your goals into a path you can actually follow.</p></article>
          <article><span>02</span><h3>Meet your person</h3><p>Find a mentor or learner who fits your pace and ambition.</p></article>
          <article><span>03</span><h3>Keep moving</h3><p>Build confidence through honest conversations and action.</p></article>
        </div>
      </section>
    </main>
  );
};

export default Landing;