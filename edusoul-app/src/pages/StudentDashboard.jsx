import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  CalendarDays,
  Check,
  Compass,
  GraduationCap,
  Layers3,
  Menu,
  MessageSquare,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  findAndAssignMentorsForStudent,
  subscribeToStudentMatches,
  syncStudentMatchingProfile,
} from "../services/mentorMatchingService";
import studyfyxLogo from "../assets/studyfyxlogo.png";
import "./StudentDashboard.css";

export default function StudentDashboard({
  onStartDreamDegreeAdvisor,
  onNavigateToCourses,
  onNavigateToAnalytics,
  onNavigateToMentorHub,
  onNavigateToMessages,
}) {
  const { user } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const userMenuButtonRef = useRef(null);
  const userMenuId = useId();

  useEffect(() => {
    if (!userMenuOpen) return;
    userMenuRef.current?.querySelector("nav button")?.focus();
    const outside = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setUserMenuOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
        userMenuButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [userMenuOpen]);

  const navigateFromUserMenu = (action) => {
    setUserMenuOpen(false);
    action?.();
  };

  const firstName =
    user?.displayName?.trim().split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    "Student";

  const [matchedMentors, setMatchedMentors] = useState([]);
  const [matchError, setMatchError] = useState("");
  const initial = firstName.charAt(0).toUpperCase();

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const modules = [
    {
      id: "degree",
      num: "01",
      icon: GraduationCap,
      tag: "DEGREE INTELLIGENCE",
      title: "FutureDream Degree Advisor",
      desc: "Connect your A/L profile and target career with university degree pathways and a step-by-step roadmap.",
      btnLabel: "Explore Degrees",
      accentColor: "#2563eb",
      glowColor: "rgba(37, 99, 235, 0.35)",
      softColor: "rgba(37, 99, 235, 0.16)",
      onClick: onStartDreamDegreeAdvisor,
      visual: (
        <svg className="sd-card-svg" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="60" r="44" stroke="#2563eb" strokeWidth="1" strokeDasharray="3 4" className="sd-svg-rotate" opacity="0.6" />
          <circle cx="80" cy="60" r="30" stroke="#3b82f6" strokeWidth="1.2" opacity="0.75" />
          <circle cx="80" cy="60" r="16" fill="url(#grad-deg)" opacity="0.85" />
          {/* Compass Star / Degree Motif */}
          <path d="M80 34L83 57L106 60L83 63L80 86L77 63L54 60L77 57Z" fill="#2563eb" opacity="0.7" className="sd-svg-pulse" />
          <circle cx="106" cy="60" r="3" fill="#60a5fa" />
          <circle cx="54" cy="60" r="3" fill="#60a5fa" />
          <circle cx="80" cy="34" r="3" fill="#38bdf8" />
          <circle cx="80" cy="86" r="3" fill="#38bdf8" />
          <defs>
            <radialGradient id="grad-deg" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.1" />
            </radialGradient>
          </defs>
        </svg>
      ),
    },
    {
      id: "career",
      num: "02",
      icon: Target,
      tag: "CAREER PATHWAY & SKILL GAP",
      title: "Career AI",
      desc: "Analyze your real-time Skill-Gap Index (SGI), explore high-demand roles, and generate an adaptive roadmap.",
      btnLabel: "Launch Career AI",
      accentColor: "#7c3aed",
      glowColor: "rgba(124, 58, 237, 0.35)",
      softColor: "rgba(124, 58, 237, 0.16)",
      onClick: onNavigateToCourses,
      visual: (
        <svg className="sd-card-svg" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ascending Trajectory Bars */}
          <rect x="38" y="70" width="8" height="24" rx="4" fill="#a855f7" opacity="0.4" className="sd-svg-bar-1" />
          <rect x="54" y="56" width="8" height="38" rx="4" fill="#a855f7" opacity="0.55" className="sd-svg-bar-2" />
          <rect x="70" y="44" width="8" height="50" rx="4" fill="#9333ea" opacity="0.7" className="sd-svg-bar-3" />
          <rect x="86" y="32" width="8" height="62" rx="4" fill="#7c3aed" opacity="0.85" className="sd-svg-bar-4" />
          {/* Dynamic Radar Target Rings */}
          <circle cx="112" cy="46" r="24" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" className="sd-svg-rotate-rev" opacity="0.65" />
          <circle cx="112" cy="46" r="14" stroke="#7c3aed" strokeWidth="1.5" opacity="0.8" />
          <circle cx="112" cy="46" r="5" fill="#c084fc" className="sd-svg-pulse" />
          {/* Arrow vector */}
          <path d="M42 68L88 32L112 46" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" opacity="0.9" />
        </svg>
      ),
    },
    {
      id: "wellbeing",
      num: "03",
      icon: Brain,
      tag: "STUDY & COGNITIVE WELLNESS",
      title: "Student Mood & Study AI",
      desc: "AI-based student mood analysis, study pattern tracking, and personalized recommendations for balanced learning.",
      btnLabel: "View Analytics",
      accentColor: "#0284c7",
      glowColor: "rgba(2, 132, 199, 0.35)",
      softColor: "rgba(2, 132, 199, 0.16)",
      onClick: onNavigateToAnalytics,
      visual: (
        <svg className="sd-card-svg" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Harmonic Sine / Brainwave Halo */}
          <path d="M25 60 Q 42 34 58 60 T 92 60 T 125 60 T 145 60" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" opacity="0.8" className="sd-svg-wave" />
          <circle cx="80" cy="60" r="34" stroke="#38bdf8" strokeWidth="1" opacity="0.4" strokeDasharray="4 4" className="sd-svg-rotate" />
          <circle cx="80" cy="60" r="20" fill="url(#grad-well)" opacity="0.75" className="sd-svg-pulse" />
          <circle cx="58" cy="60" r="3.5" fill="#38bdf8" />
          <circle cx="92" cy="60" r="3.5" fill="#38bdf8" />
          <circle cx="80" cy="60" r="4.5" fill="#0284c7" />
          <defs>
            <radialGradient id="grad-well" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
            </radialGradient>
          </defs>
        </svg>
      ),
    },
    {
      id: "mentors",
      num: "04",
      icon: Users,
      tag: "VERIFIED MENTORS",
      title: "Professional Mentorship Hub",
      desc: "Connect 1-on-1 with verified industry leaders and university lecturers for structured career guidance.",
      btnLabel: "Find Mentors",
      accentColor: "#0d9488",
      glowColor: "rgba(13, 148, 136, 0.35)",
      softColor: "rgba(13, 148, 136, 0.16)",
      onClick: onNavigateToMentorHub,
      visual: (
        <svg className="sd-card-svg" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dual Connected Mentorship Network Nodes */}
          <circle cx="58" cy="56" r="18" stroke="#14b8a6" strokeWidth="1.5" opacity="0.8" />
          <circle cx="58" cy="56" r="6" fill="#0d9488" className="sd-svg-pulse" />
          <circle cx="102" cy="64" r="14" stroke="#0d9488" strokeWidth="1.5" opacity="0.7" />
          <circle cx="102" cy="64" r="5" fill="#2dd4bf" />
          {/* Connection Arc & Sparkles */}
          <path d="M58 56 C 70 38, 90 42, 102 64" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="3 3" opacity="0.85" className="sd-svg-dash" />
          <circle cx="80" cy="45" r="3" fill="#5eead4" className="sd-svg-pulse" />
          <circle cx="40" cy="40" r="2" fill="#14b8a6" opacity="0.6" />
          <circle cx="120" cy="50" r="2" fill="#14b8a6" opacity="0.6" />
        </svg>
      ),
    },
    {
      id: "messages",
      num: "05",
      icon: MessageSquare,
      tag: "LIVE MESSAGING",
      title: "Mentor Chat & Support",
      desc: "Direct 1-on-1 real-time messaging with your mentors for academic advice, portfolio review, and guidance.",
      btnLabel: "Open Messages",
      accentColor: "#334155",
      glowColor: "rgba(51, 65, 85, 0.32)",
      softColor: "rgba(51, 65, 85, 0.14)",
      onClick: onNavigateToMessages || onNavigateToMentorHub,
      visual: (
        <svg className="sd-card-svg" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Layered Glass Speech Bubbles */}
          <rect x="42" y="38" width="56" height="36" rx="10" stroke="#64748b" strokeWidth="1.5" fill="rgba(255,255,255,0.4)" opacity="0.8" className="sd-svg-float-1" />
          {/* 3 Animated Typing Indicator Dots */}
          <circle cx="58" cy="56" r="3" fill="#3b82f6" className="sd-svg-dot-1" />
          <circle cx="70" cy="56" r="3" fill="#64748b" className="sd-svg-dot-2" />
          <circle cx="82" cy="56" r="3" fill="#94a3b8" className="sd-svg-dot-3" />
          {/* Secondary response bubble */}
          <rect x="74" y="58" width="48" height="30" rx="8" stroke="#3b82f6" strokeWidth="1.2" fill="rgba(255,255,255,0.5)" opacity="0.85" className="sd-svg-float-2" />
          <circle cx="98" cy="73" r="3" fill="#3b82f6" className="sd-svg-pulse" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    if (!user?.uid) return undefined;

    const unsubscribe = subscribeToStudentMatches(
      user.uid,
      setMatchedMentors,
      (error) => {
        console.warn("Could not load mentor matches:", error);
        setMatchError("Matched mentors are temporarily unavailable.");
      },
    );

    syncStudentMatchingProfile(user.uid)
      .then((profile) => profile && findAndAssignMentorsForStudent(user.uid))
      .catch((error) => {
        console.warn(
          "Could not sync student profile or auto-assign mentors:",
          error,
        );
      });

    return unsubscribe;
  }, [user?.uid]);

  return (
    <div className="study-dashboard">
      {/* ── Top Navigation Bar ── */}
      <header className="sd-topbar">
        <div className="sd-brand">
          <img src={studyfyxLogo} alt="Studyfyx" />
          <span className="sd-brand-divider" />
          <div>
            <span className="sd-eyebrow">YOUR PERSONAL WORKSPACE</span>
            <p>Student dashboard</p>
          </div>
        </div>

        <div className="sd-topbar-right">
          <span className="sd-date">
            <CalendarDays size={14} aria-hidden="true" />
            {formattedDate}
          </span>
          <div
            className="sd-user-menu"
            ref={userMenuRef}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setUserMenuOpen(false);
              }
            }}
          >
            <button
              type="button"
              className="sd-user-trigger"
              ref={userMenuButtonRef}
              aria-label={userMenuOpen ? "Close user menu" : "Open user menu"}
              aria-expanded={userMenuOpen}
              aria-controls={userMenuId}
              onClick={() => setUserMenuOpen((value) => !value)}
            >
              <span className="sd-avatar" aria-hidden="true">
                {initial}
              </span>
              {userMenuOpen ? (
                <X size={16} aria-hidden="true" />
              ) : (
                <Menu size={16} aria-hidden="true" />
              )}
            </button>
            {userMenuOpen && (
              <div className="sd-user-popover" id={userMenuId}>
                <div className="sd-user-details">
                  <strong>{user?.displayName || firstName}</strong>
                  {user?.email && <span>{user.email}</span>}
                  <small>Student workspace</small>
                </div>
                <nav aria-label="User menu">
                  <button
                    type="button"
                    onClick={() =>
                      navigateFromUserMenu(onStartDreamDegreeAdvisor)
                    }
                  >
                    <GraduationCap size={16} aria-hidden="true" />
                    Dream Degree Advisor
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateFromUserMenu(onNavigateToCourses)}
                  >
                    <Target size={16} aria-hidden="true" />
                    Career AI
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateFromUserMenu(onNavigateToAnalytics)}
                  >
                    <Brain size={16} aria-hidden="true" />
                    Student Wellbeing
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateFromUserMenu(onNavigateToMentorHub)}
                  >
                    <Users size={16} aria-hidden="true" />
                    Mentorship Hub
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigateFromUserMenu(
                        onNavigateToMessages || onNavigateToMentorHub,
                      )
                    }
                  >
                    <MessageSquare size={16} aria-hidden="true" />
                    Mentor Messages
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Dashboard Content ── */}
      <div className="sd-content">
        {/* Sleek Greeting Header */}
        <div className="sd-welcome">
          <div className="sd-welcome-left">
            <p>
              {greeting}, <strong>{firstName}</strong>
            </p>
            <span className="sd-welcome-dot">·</span>
            <h1>A clearer direction. A stronger future.</h1>
          </div>
          <span className="sd-workspace-label">
            <Layers3 size={14} aria-hidden="true" /> Your learning workspace
          </span>
        </div>

        {/* ── Compact Top Hero Banner with Integrated Image ── */}
        <section className="sd-hero" aria-labelledby="sd-hero-title">
          <div className="sd-hero-copy">
            <span className="sd-hero-kicker">
              <Sparkles size={13} aria-hidden="true" /> PURPOSEFUL PLANNING,
              PERSONAL TO YOU
            </span>
            <h2 id="sd-hero-title">
              Big ambitions. <span>Clear next steps.</span>
            </h2>
            <p>
              Bring your education, skills and career goals together. Start with
              a direction, then build an AI-powered path that works for you.
            </p>
            <div className="sd-hero-actions">
              <button
                type="button"
                className="sd-hero-primary-btn"
                onClick={onStartDreamDegreeAdvisor}
              >
                Plan my future <ArrowRight size={15} aria-hidden="true" />
              </button>
              <span className="sd-hero-footnote">
                <Check size={13} aria-hidden="true" /> Degree pathways · Career
                skills · Wellbeing & Mentorship
              </span>
            </div>
          </div>

          <div className="sd-hero-visual">
            <img
              src="/dashboard_banner.jpg"
              alt="Students collaborating in study workspace"
            />
          </div>
        </section>

        {/* ── Core Research Modules: 5 Frosted Glassmorphism Cards ── */}
        <section className="sd-modules-section" aria-labelledby="sd-tools-heading">
          <div className="sd-section-head">
            <div>
              <h2 id="sd-tools-heading">Your learning workspace</h2>
              <p>Five AI-powered modules to plan, grow and stay balanced.</p>
            </div>
            <span className="sd-section-pill">
              <Sparkles size={13} aria-hidden="true" /> AI-Powered Platform
            </span>
          </div>

          <div className="sd-cards-track">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.id}
                  className={`sd-arch-card sd-card-${m.id}`}
                  style={{
                    "--accent": m.accentColor,
                    "--accent-glow": m.glowColor,
                    "--accent-soft": m.softColor,
                  }}
                  onClick={m.onClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      m.onClick?.();
                    }
                  }}
                >
                  {/* Ambient Glowing Blobs & Animated Graphic in Background */}
                  <div className="sd-card-ambient" aria-hidden="true">
                    <div className="sd-ambient-blob b-primary" />
                    <div className="sd-ambient-blob b-secondary" />
                    <div className="sd-ambient-graphic">
                      {m.visual}
                    </div>
                  </div>

                  {/* Frosted Glass Specular Sheen */}
                  <div className="sd-card-glass-sheen" aria-hidden="true" />

                  {/* Top Bar: Glass Icon Symbol + Index Number */}
                  <div className="sd-card-head">
                    <div className="sd-icon-symbol">
                      <Icon size={19} strokeWidth={2.2} aria-hidden="true" />
                    </div>
                    <span className="sd-index-num">{m.num}</span>
                  </div>

                  {/* Middle / Content */}
                  <div className="sd-card-content">
                    <span className="sd-tag-line">{m.tag}</span>
                    <h3 className="sd-card-main-title">{m.title}</h3>
                    <p className="sd-card-desc">{m.desc}</p>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="sd-card-action-row">
                    <span className="sd-action-text">{m.btnLabel}</span>
                    <div className="sd-arrow-circle" aria-hidden="true">
                      <ArrowUpRight size={15} strokeWidth={2.4} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Secondary Section (Below the Fold): Mentor Matches ── */}
        {matchedMentors.length > 0 && (
          <section
            className="sd-mentor-preview-section"
            aria-labelledby="mentor-matches-heading"
          >
            <div className="sd-mentor-preview-head">
              <div>
                <span className="sd-mentor-eyebrow">YOUR MENTOR MATCHES</span>
                <h3 id="mentor-matches-heading">
                  Guidance matched to your goals
                </h3>
              </div>
              <button
                type="button"
                onClick={onNavigateToMentorHub}
                className="sd-mentor-viewall-btn"
              >
                Find More Mentors <ArrowUpRight size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="sd-mentor-preview-grid">
              {matchedMentors.slice(0, 4).map((match) => (
                <article key={match.id} className="sd-mentor-preview-card">
                  <div className="sd-mentor-preview-info">
                    <strong>{match.mentorName}</strong>
                    <p>
                      {match.mentorSpecialization || match.mentorField}
                      {match.mentorHighestDegree
                        ? ` · ${match.mentorHighestDegree}`
                        : ""}
                    </p>
                    <span className="sd-mentor-match-badge">
                      {Math.round(match.compatibilityScore || 0)}% compatibility
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigateToMessages?.({
                        uid: match.mentorId,
                        name: match.mentorName,
                        field: match.mentorField,
                      })
                    }
                    className="sd-mentor-chat-btn"
                  >
                    Open chat
                  </button>
                </article>
              ))}
            </div>
            {matchError && (
              <p role="status" className="sd-match-error">
                {matchError}
              </p>
            )}
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="sd-footer">
          <span>
            Studyfyx <span aria-hidden="true">/</span> Built for your next chapter.
          </span>
          <span>Plan thoughtfully. Grow confidently.</span>
        </footer>
      </div>
    </div>
  );
}
