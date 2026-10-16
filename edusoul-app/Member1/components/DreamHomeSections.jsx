import { useAdvisorTranslation } from '../data/advisorTranslations';
import React from "react";

export function StatsSection({ stats }) {
  const tr = useAdvisorTranslation();
  return (
    <section className="stats-section scroll-reveal">

      <div className="stats-container">

        {tr(stats.map(
          ([icon, number, label]) => (

            <div
              className="stat"
              key={label}
            >

              <div className="stat-icon">
                {tr(icon)}
              </div>

              <div className="stat-number">
                {tr(number)}
              </div>

              <div className="stat-label">
                {tr(label)}
              </div>

            </div>

          )
        ))}

      </div>

    </section>
  );
}

export function AISection({ onLogin }) {
  const tr = useAdvisorTranslation();
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

          <span className="section-label">{tr("AI-POWERED GUIDANCE")}</span>

          <h2>{tr("Your future,")}<span>
              {" "}{tr("intelligently planned.")}</span>
          </h2>

          <p>{tr("DreamDegree analyzes your academic profile, personality, interests and future goals to provide personalized recommendations.")}</p>

          <div className="ai-list">

            <div>
              <span>✓</span>{tr("Personalized future goal recommendations")}</div>

            <div>
              <span>✓</span>{tr("Degree and university matching")}</div>

            <div>
              <span>✓</span>{tr("Explainable AI recommendations")}</div>

            <div>
              <span>✓</span>{tr("Personalized future goal roadmap")}</div>

          </div>

          <button className="primary-button" onClick={onLogin}>{tr("Discover My Future Goal")}<span>→</span>
          </button>

        </div>

      </div>

    </section>
  );
}

export function RoadmapSection() {
  const tr = useAdvisorTranslation();
  return (
    <section
      className="roadmap-section scroll-reveal"
      id="roadmap"
    >

      <div className="section-heading">

        <span className="section-label">{tr("YOUR FUTURE GOAL JOURNEY")}</span>

        <h2>{tr("From student to")}<span>{tr("success.")}</span>
        </h2>

      </div>

      <div className="roadmap">

        <div className="roadmap-line" />

        {tr([
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
                {tr(number)}
              </div>

              <h3>
                {tr(title)}
              </h3>

              <p>
                {tr(text)}
              </p>

            </div>

          )
        ))}

      </div>

    </section>
  );
}

export function UniversitiesSection({ universities }) {
  const tr = useAdvisorTranslation();
  return (
    <section
      className="universities-section scroll-reveal from-right"
      id="about"
    >

      <p>{tr("TRUSTED BY STUDENTS ACROSS SRI LANKA")}</p>

      <div className="university-list">

        {tr(universities.map(
          (university) => (

            <div
              className="university"
              key={university}
            >

              <span className="university-symbol">
                ◈
              </span>

              {tr(university)}

            </div>

          )
        ))}

      </div>

    </section>
  );
}

export function CTASection({ onStart, onLogin, onLogout }) {
  const tr = useAdvisorTranslation();
  return (
    <section className="cta-section scroll-reveal scale-up">

      <div className="cta-content">

        <span className="section-label">{tr("START YOUR JOURNEY")}</span>

        <h2>{tr("Your future is waiting.")}</h2>

        <p>{tr("Let AI help you discover the degree, future goal and future that fits you.")}</p>

        <button className="primary-button" onClick={onLogout ? onStart : onLogin}>
          {tr(onLogout ? 'Start Analysis' : 'Get Started')}
          <span>→</span>
        </button>

      </div>

    </section>
  );
}

export function Footer() {
  const tr = useAdvisorTranslation();
  return (
    <footer>

      <div className="footer-logo">{tr("Dream Degree")}<span>{tr("Advisor")}</span>
      </div>

      <p>{tr("AI-powered future goal guidance for Sri Lankan students.")}</p>

      <div className="footer-bottom">{tr("© 2026 DreamDegree. All rights reserved.")}</div>

    </footer>
  );
}
