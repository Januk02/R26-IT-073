import React from "react";

export function StatsSection({ stats }) {
  return (
    <section className="stats-section scroll-reveal">

      <div className="stats-container">

        {stats.map(
          ([icon, number, label]) => (

            <div
              className="stat"
              key={label}
            >

              <div className="stat-icon">
                {icon}
              </div>

              <div className="stat-number">
                {number}
              </div>

              <div className="stat-label">
                {label}
              </div>

            </div>

          )
        )}

      </div>

    </section>
  );
}

export function AISection({ onLogin }) {
  return (
    <section
      className="ai-section scroll-reveal from-left"
      id="ai"
    >

      <div className="ai-container">

        <div className="ai-visual">

          <div className="ai-circle">

            <div className="ai-core">
              AI
            </div>

            <div className="orbit orbit-1" />

            <div className="orbit orbit-2" />

          </div>

        </div>

        <div className="ai-content">

          <span className="section-label">
            AI-POWERED GUIDANCE
          </span>

          <h2>
            Your future,
            <span>
              {" "}intelligently planned.
            </span>
          </h2>

          <p>
            DreamDegree analyzes your academic profile,
            personality, interests and future goals to
            provide personalized recommendations.
          </p>

          <div className="ai-list">

            <div>
              <span>✓</span>
              Personalized future goal recommendations
            </div>

            <div>
              <span>✓</span>
              Degree and university matching
            </div>

            <div>
              <span>✓</span>
              Explainable AI recommendations
            </div>

            <div>
              <span>✓</span>
              Personalized future goal roadmap
            </div>

          </div>

          <button className="primary-button" onClick={onLogin}>
            Discover My Future Goal
            <span>→</span>
          </button>

        </div>

      </div>

    </section>
  );
}

export function RoadmapSection() {
  return (
    <section
      className="roadmap-section scroll-reveal"
      id="roadmap"
    >

      <div className="section-heading">

        <span className="section-label">
          YOUR FUTURE GOAL JOURNEY
        </span>

        <h2>
          From student to
          <span> success.</span>
        </h2>

      </div>

      <div className="roadmap">

        <div className="roadmap-line" />

        {[
          [
            "01",
            "Discover Yourself",
            "Understand your interests, personality and strengths.",
          ],
          [
            "02",
            "Find Your Future Goal",
            "Discover future goals that match your unique profile.",
          ],
          [
            "03",
            "Choose Your Degree",
            "Find degree programs and universities.",
          ],
          [
            "04",
            "Build Your Future",
            "Follow your personalized future goal roadmap.",
          ],
        ].map(
          ([number, title, text]) => (

            <div
              className="roadmap-step"
              key={number}
            >

              <div className="step-number">
                {number}
              </div>

              <h3>
                {title}
              </h3>

              <p>
                {text}
              </p>

            </div>

          )
        )}

      </div>

    </section>
  );
}

export function UniversitiesSection({ universities }) {
  return (
    <section
      className="universities-section scroll-reveal from-right"
      id="about"
    >

      <p>
        TRUSTED BY STUDENTS ACROSS SRI LANKA
      </p>

      <div className="university-list">

        {universities.map(
          (university) => (

            <div
              className="university"
              key={university}
            >

              <span className="university-symbol">
                ◈
              </span>

              {university}

            </div>

          )
        )}

      </div>

    </section>
  );
}

export function CTASection({ onStart, onLogin, onLogout }) {
  return (
    <section className="cta-section scroll-reveal scale-up">

      <div className="cta-content">

        <span className="section-label">
          START YOUR JOURNEY
        </span>

        <h2>
          Your future is waiting.
        </h2>

        <p>
          Let AI help you discover the degree,
          future goal and future that fits you.
        </p>

        <button className="primary-button" onClick={onLogout ? onStart : onLogin}>
          {onLogout ? 'Start Analysis' : 'Get Started'}
          <span>→</span>
        </button>

      </div>

    </section>
  );
}

export function Footer() {
  return (
    <footer>

      <div className="footer-logo">
        Dream Degree <span>Advisor</span>
      </div>

      <p>
        AI-powered future goal guidance for Sri Lankan students.
      </p>

      <div className="footer-bottom">
        © 2026 DreamDegree. All rights reserved.
      </div>

    </footer>
  );
}
