import { useAdvisorTranslation } from '../data/advisorTranslations';
import React from "react";

export default function DreamHomeHero({ onStart, features, hom2Image }) {
  const tr = useAdvisorTranslation();
  return (
    <section
      className="hero hero-animate-in"
      id="home"
    >

      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />

      <div className="hero-container">

        {/* LEFT */}

        <div className="hero-content">

          <div className="eyebrow">
            <span>✦</span>{tr("AI-POWERED FUTURE GOAL DISCOVERY")}</div>

          <h1>{tr("Discover.")}<br />{tr("Plan.")}<br />
            <span>{tr("Succeed.")}</span>
          </h1>

          <p className="hero-description">{tr("Personalized future goal guidance powered by AI to help you find the")}{" "}
            <strong>{tr("perfect degree")}</strong>{" "}{tr("and build your future.")}</p>

          <div className="hero-actions">

            <button
              className="primary-button"
              onClick={onStart}
            >{tr("Start Your Journey")}<span>→</span>
            </button>

            <button className="demo-button">

              <span className="play">
                ▶
              </span>{tr("Watch Demo")}</button>

          </div>

        </div>

        {/* RIGHT */}

        <div className="hero-visual">

          <div className="hero-curve" />

          <div className="platform">
            <div className="platform-glow" />
          </div>

          {/*
            Put your generated 3D image here.

            File:
            public/student-avatar.png
          */}

          <div className="student-wrapper">

            <img
              src={hom2Image}
              alt={tr("DreamDegree student")}
              className="student-avatar"
            />

          </div>

          {/* Floating Cards */}

          {tr(features.map(
            (feature) => (

              <div
                className={`feature-card ${feature.className}`}
                key={feature.title}
              >

                <div className="feature-icon">
                  {tr(feature.icon)}
                </div>

                <div>

                  <h3>
                    {tr(feature.title)}
                  </h3>

                  <p>
                    {tr(feature.text)}
                  </p>

                </div>

              </div>

            )
          ))}

        </div>

      </div>

    </section>
  );
}
