import React from "react";

export default function DreamHomeHero({ onStart, features, hom2Image }) {
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
            <span>✦</span>
            AI-POWERED FUTURE GOAL DISCOVERY
          </div>

          <h1>
            Discover.
            <br />
            Plan.
            <br />
            <span>Succeed.</span>
          </h1>

          <p className="hero-description">
            Personalized future goal guidance powered by AI
            to help you find the{" "}
            <strong>perfect degree</strong>{" "}
            and build your future.
          </p>

          <div className="hero-actions">

            <button
              className="primary-button"
              onClick={onStart}
            >
              Start Your Journey
              <span>→</span>
            </button>

            <button className="demo-button">

              <span className="play">
                ▶
              </span>

              Watch Demo

            </button>

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
              alt="DreamDegree student"
              className="student-avatar"
            />

          </div>

          {/* Floating Cards */}

          {features.map(
            (feature) => (

              <div
                className={`feature-card ${feature.className}`}
                key={feature.title}
              >

                <div className="feature-icon">
                  {feature.icon}
                </div>

                <div>

                  <h3>
                    {feature.title}
                  </h3>

                  <p>
                    {feature.text}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </section>
  );
}
