import React, { useState, useRef, useEffect } from "react";
import hom2Image from "../../src/assets/hom2.png";
import { dreamJobs } from "../data/dreamDegreeData";
import { useLanguage } from "../../src/App";
import { translations } from "../data/languageTranslations";
import { useAuth } from "../../src/contexts/AuthContext";

export default function App({ onStart, onLogin, onLogout, onNavigateToDashboard, onViewProfile }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const avatarRef = useRef(null);
  const portalRef = useRef(null);
  let authUser = null;
  try { const auth = useAuth(); authUser = auth?.user; } catch(e) {}

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
      if (portalRef.current && !portalRef.current.contains(e.target)) setPortalOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Scroll-reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const { language, changeLanguage } = useLanguage();
  const t = translations[language];

  // Get unique categories
  const categories = ["All", ...new Set(dreamJobs.map(job => job.category))];

  // Filter jobs based on search and category
  const filteredJobs = dreamJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Display jobs (show first 12 if no search, otherwise show filtered results)
  const displayJobs = searchTerm || selectedCategory !== "All" ? filteredJobs : dreamJobs.slice(0, 12);

  const features = [
    {
      icon: "🧠",
      title: t.aiGuidance,
      text: t.aiGuidanceDesc,
      className: "ai-card",
    },
    {
      icon: "⌘",
      title: t.roadmap,
      text: t.roadmapDesc,
      className: "roadmap-card",
    },
    {
      icon: "🎓",
      title: t.degreeMatch,
      text: t.degreeMatchDesc,
      className: "degree-card",
    },
    {
      icon: "🏛️",
      title: t.universityFinder,
      text: t.universityFinderDesc,
      className: "university-card",
    },
  ];

  const stats = [
    ["♧", "500+", "Future Goals Explored"],
    ["🎓", "1000+", "Students Guided"],
    ["🏆", "95%", "Success Rate"],
    ["☆", "4.9/5", "Student Rating"],
  ];

  const universities = [
    "University of Moratuwa",
    "University of Colombo",
    "SLIIT",
    "NSBM Green University",
    "IIT Sri Lanka",
    "UCSC Sri Lanka",
  ];

  return (
    <>
      <style>{`

        /* =====================================================
           RESET
        ===================================================== */

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          background: #ffffff;
          color: #101828;
        }

        button {
          font-family: inherit;
          cursor: pointer;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        /* =====================================================
           SCROLL REVEAL ANIMATIONS
        ===================================================== */

        .scroll-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* Stagger children */
        .scroll-reveal.revealed .stagger-child {
          opacity: 1;
          transform: translateY(0);
        }
        .stagger-child {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .stagger-child:nth-child(1) { transition-delay: 0.08s; }
        .stagger-child:nth-child(2) { transition-delay: 0.16s; }
        .stagger-child:nth-child(3) { transition-delay: 0.24s; }
        .stagger-child:nth-child(4) { transition-delay: 0.32s; }
        .stagger-child:nth-child(5) { transition-delay: 0.40s; }
        .stagger-child:nth-child(6) { transition-delay: 0.48s; }
        .stagger-child:nth-child(7) { transition-delay: 0.56s; }
        .stagger-child:nth-child(8) { transition-delay: 0.64s; }

        /* Slide from left */
        .scroll-reveal.from-left {
          transform: translateX(-50px);
        }
        .scroll-reveal.from-left.revealed {
          transform: translateX(0);
        }

        /* Slide from right */
        .scroll-reveal.from-right {
          transform: translateX(50px);
        }
        .scroll-reveal.from-right.revealed {
          transform: translateX(0);
        }

        /* Scale up */
        .scroll-reveal.scale-up {
          transform: scale(0.9);
        }
        .scroll-reveal.scale-up.revealed {
          transform: scale(1);
        }

        /* Hero entrance (plays immediately, no scroll trigger needed) */
        .hero-animate-in .hero-content {
          animation: heroSlideRight 1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
        }
        .hero-animate-in .hero-visual {
          animation: heroSlideLeft 1s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both;
        }
        .hero-animate-in .eyebrow {
          animation: heroBadgePop 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
        }
        .hero-animate-in h1 {
          animation: heroTextReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.7s both;
        }
        .hero-animate-in .hero-description {
          animation: heroTextReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.9s both;
        }
        .hero-animate-in .hero-actions {
          animation: heroTextReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 1.1s both;
        }

        @keyframes heroSlideRight {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes heroSlideLeft {
          from { opacity: 0; transform: translateX(60px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes heroBadgePop {
          from { opacity: 0; transform: translateY(-15px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes heroTextReveal {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Stat counter bounce */
        .scroll-reveal.revealed .stat {
          animation: statPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .scroll-reveal.revealed .stat:nth-child(1) { animation-delay: 0.1s; }
        .scroll-reveal.revealed .stat:nth-child(2) { animation-delay: 0.2s; }
        .scroll-reveal.revealed .stat:nth-child(3) { animation-delay: 0.3s; }
        .scroll-reveal.revealed .stat:nth-child(4) { animation-delay: 0.4s; }
        @keyframes statPop {
          0% { opacity: 0; transform: translateY(30px) scale(0.9); }
          60% { transform: translateY(-5px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Career card cascade */
        .scroll-reveal.revealed .career-card {
          animation: cardCascade 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .scroll-reveal.revealed .career-card:nth-child(1) { animation-delay: 0.05s; }
        .scroll-reveal.revealed .career-card:nth-child(2) { animation-delay: 0.10s; }
        .scroll-reveal.revealed .career-card:nth-child(3) { animation-delay: 0.15s; }
        .scroll-reveal.revealed .career-card:nth-child(4) { animation-delay: 0.20s; }
        .scroll-reveal.revealed .career-card:nth-child(5) { animation-delay: 0.25s; }
        .scroll-reveal.revealed .career-card:nth-child(6) { animation-delay: 0.30s; }
        .scroll-reveal.revealed .career-card:nth-child(7) { animation-delay: 0.35s; }
        .scroll-reveal.revealed .career-card:nth-child(8) { animation-delay: 0.40s; }
        .scroll-reveal.revealed .career-card:nth-child(9) { animation-delay: 0.45s; }
        .scroll-reveal.revealed .career-card:nth-child(10) { animation-delay: 0.50s; }
        .scroll-reveal.revealed .career-card:nth-child(11) { animation-delay: 0.55s; }
        .scroll-reveal.revealed .career-card:nth-child(12) { animation-delay: 0.60s; }
        @keyframes cardCascade {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Roadmap step stagger */
        .scroll-reveal.revealed .roadmap-step {
          animation: stepSlideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .scroll-reveal.revealed .roadmap-step:nth-child(2) { animation-delay: 0.15s; }
        .scroll-reveal.revealed .roadmap-step:nth-child(3) { animation-delay: 0.30s; }
        .scroll-reveal.revealed .roadmap-step:nth-child(4) { animation-delay: 0.45s; }
        .scroll-reveal.revealed .roadmap-step:nth-child(5) { animation-delay: 0.60s; }
        @keyframes stepSlideUp {
          from { opacity: 0; transform: translateY(35px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* University marquee-like fade in */
        .scroll-reveal.revealed .university {
          animation: uniFadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .scroll-reveal.revealed .university:nth-child(1) { animation-delay: 0.05s; }
        .scroll-reveal.revealed .university:nth-child(2) { animation-delay: 0.10s; }
        .scroll-reveal.revealed .university:nth-child(3) { animation-delay: 0.15s; }
        .scroll-reveal.revealed .university:nth-child(4) { animation-delay: 0.20s; }
        .scroll-reveal.revealed .university:nth-child(5) { animation-delay: 0.25s; }
        .scroll-reveal.revealed .university:nth-child(6) { animation-delay: 0.30s; }
        .scroll-reveal.revealed .university:nth-child(7) { animation-delay: 0.35s; }
        .scroll-reveal.revealed .university:nth-child(8) { animation-delay: 0.40s; }
        @keyframes uniFadeIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* CTA pulse glow */
        .scroll-reveal.scale-up.revealed .cta-content {
          animation: ctaGlow 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
        }
        @keyframes ctaGlow {
          0% { opacity: 0; transform: scale(0.95); }
          60% { transform: scale(1.01); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* =====================================================
           MAIN
        ===================================================== */

        .dream-degree {
          min-height: 100vh;
          overflow: hidden;
          background: #ffffff;
        }

        /* =====================================================
           NAVBAR
        ===================================================== */

        .navbar {
          height: 86px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 4%;

          background: rgba(255, 255, 255, 0.9);

          backdrop-filter: blur(18px);

          border-bottom: 1px solid #edf2f7;

          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .logo-symbol {
          width: 40px;
          height: 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #0789ff,
              #2563eb
            );

          color: white;

          font-size: 24px;
          font-weight: 900;

          box-shadow:
            0 8px 25px rgba(37, 99, 235, 0.25);
        }

        .logo-name {
          font-size: 21px;
          font-weight: 800;
          color: #101828;
        }

        .logo-name span {
          color: #147af3;
        }

        .logo-subtitle {
          font-size: 7px;
          letter-spacing: 3px;
          color: #147af3;
          margin-top: 2px;
        }

        .navbar nav {
          display: flex;
          align-items: center;
          gap: 35px;
        }

        .navbar nav a {
          font-size: 14px;
          color: #475467;

          position: relative;

          transition: 0.25s ease;
        }

        .navbar nav a:hover {
          color: #1677ff;
        }

        .navbar nav a.active {
          color: #1677ff;
        }

        .navbar nav a.active::after {
          content: "";

          position: absolute;

          left: 0;
          right: 0;

          bottom: -31px;

          height: 2px;

          background: #1677ff;

          border-radius: 10px;
        }

        .nav-button {
          border: none;

          padding: 13px 22px;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #087cff,
              #2463eb
            );

          color: white;

          font-size: 14px;

          font-weight: 700;

          box-shadow:
            0 12px 30px
            rgba(37, 99, 235, 0.22);

          transition: 0.3s ease;
        }

        .nav-button span {
          margin-left: 10px;
        }

        .nav-button:hover {
          transform: translateY(-3px);

          box-shadow:
            0 18px 35px
            rgba(37, 99, 235, 0.3);
        }

        /* Portal Button */
        .portal-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 14px;
          border: 2px solid #e2e8f0;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          color: #475467;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        .portal-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          box-shadow: 0 4px 20px rgba(59,130,246,0.12);
          transform: translateY(-2px);
        }
        .portal-btn.active {
          border-color: #3b82f6;
          color: #3b82f6;
          background: #eff6ff;
        }
        .portal-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 260px;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(24px);
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.05);
          z-index: 1000;
          overflow: hidden;
          animation: portalDropIn 0.2s ease-out;
        }
        @keyframes portalDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .portal-dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 18px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #334155;
          transition: background 0.15s;
        }
        .portal-dropdown-item:hover {
          background: #f1f5f9;
        }
        .portal-dropdown-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Language Switcher */
        .language-switcher {
          display: flex;
          gap: 8px;
          margin-right: 20px;
        }

        .lang-btn {
          padding: 8px 14px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .lang-btn:hover {
          border-color: #2563eb;
          color: #2563eb;
        }

        .lang-btn.active {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          border-color: #2563eb;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .hero {
          min-height: 690px;

          position: relative;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 78% 50%,
              rgba(219, 237, 255, 0.65),
              transparent 32%
            ),
            #ffffff;
        }

        .hero-container {
          width: 92%;
          max-width: 1450px;

          margin: auto;

          min-height: 690px;

          display: grid;

          grid-template-columns:
            0.85fr 1.15fr;

          align-items: center;
        }

        /* =====================================================
           BACKGROUND
        ===================================================== */

        .background-orb {
          position: absolute;

          border-radius: 50%;

          filter: blur(60px);

          pointer-events: none;
        }

        .orb-one {
          width: 300px;
          height: 300px;

          right: 0;
          top: 100px;

          background:
            rgba(99, 173, 255, 0.13);
        }

        .orb-two {
          width: 220px;
          height: 220px;

          left: 30%;
          bottom: 0;

          background:
            rgba(145, 105, 255, 0.08);
        }

        /* =====================================================
           HERO LEFT
        ===================================================== */

        .hero-content {
          padding-left: 30px;

          position: relative;

          z-index: 10;
        }

        .eyebrow {
          display: inline-flex;

          align-items: center;

          gap: 10px;

          padding: 10px 18px;

          border-radius: 30px;

          border: 1px solid #cfe4ff;

          background: #f7fbff;

          color: #1677ff;

          font-size: 11px;

          letter-spacing: 1px;

          font-weight: 700;

          margin-bottom: 28px;
        }

        .eyebrow span {
          font-size: 16px;
        }

        .hero h1 {
          font-size:
            clamp(55px, 6vw, 86px);

          line-height: 0.98;

          letter-spacing: -4px;

          font-weight: 850;

          color: #101828;

          margin-bottom: 30px;
        }

        .hero h1 span {
          color: #147df5;
        }

        .hero-description {
          max-width: 500px;

          font-size: 18px;

          line-height: 1.7;

          color: #475467;

          margin-bottom: 34px;
        }

        .hero-description strong {
          color: #1677ff;
        }

        .hero-actions {
          display: flex;

          align-items: center;

          gap: 25px;
        }

        .primary-button {
          border: none;

          padding: 16px 27px;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #087cff,
              #2463eb
            );

          color: white;

          font-size: 15px;

          font-weight: 700;

          box-shadow:
            0 12px 30px
            rgba(37, 99, 235, 0.22);

          transition: 0.3s ease;
        }

        .primary-button span {
          margin-left: 12px;
        }

        .primary-button:hover {
          transform: translateY(-3px);

          box-shadow:
            0 18px 40px
            rgba(37, 99, 235, 0.3);
        }

        .demo-button {
          display: flex;

          align-items: center;

          gap: 12px;

          border: none;

          background: transparent;

          color: #344054;

          font-weight: 600;
        }

        .play {
          width: 42px;
          height: 42px;

          border-radius: 50%;

          display: flex;

          align-items: center;
          justify-content: center;

          color: #147df5;

          border: 1px solid #cbdcf2;

          background: white;

          box-shadow:
            0 6px 20px
            rgba(0, 0, 0, 0.06);
        }

        /* =====================================================
           HERO 3D VISUAL
        ===================================================== */

        .hero-visual {
          height: 640px;

          position: relative;

          display: flex;

          align-items: center;

          justify-content: center;
        }

        .hero-curve {
          position: absolute;

          width: 720px;
          height: 720px;

          border-radius: 50%;

          border-top:
            14px solid
            rgba(205, 225, 255, 0.75);

          border-right:
            14px solid
            rgba(205, 225, 255, 0.75);

          transform:
            rotate(-20deg)
            translate(100px, -100px);

          pointer-events: none;
        }

        /* =====================================================
           PLATFORM
        ===================================================== */

        .platform {
          position: absolute;

          bottom: 25px;

          width: 600px;
          height: 120px;

          border-radius: 50%;

          background:
            linear-gradient(
              to bottom,
              #ffffff,
              #e9eef7
            );

          box-shadow:
            0 30px 70px
            rgba(27, 92, 170, 0.15),

            inset 0 2px 0 white;

          transform:
            perspective(500px)
            rotateX(55deg);

          border:
            1px solid #d9e4f2;
        }

        .platform::before {
          content: "";

          position: absolute;

          inset: 15px;

          border-radius: 50%;

          border: 2px solid #b9d8ff;

          box-shadow:
            0 0 25px
            rgba(52, 135, 255, 0.3);
        }

        .platform-glow {
          position: absolute;

          width: 400px;
          height: 80px;

          left: 100px;
          top: 20px;

          border-radius: 50%;

          background:
            rgba(53, 133, 255, 0.18);

          filter: blur(25px);
        }

        /* =====================================================
           STUDENT IMAGE
        ===================================================== */

        .student-wrapper {
          position: absolute;

          bottom: 70px;

          width: 430px;

          z-index: 10;

          display: flex;

          justify-content: center;
        }

        .student-avatar {
          width: 100%;

          max-height: 570px;

          object-fit: contain;

          filter:
            drop-shadow(
              0 30px 35px
              rgba(22, 62, 110, 0.18)
            );

          animation:
            studentFloat
            5s ease-in-out
            infinite;
        }

        @keyframes studentFloat {

          0%,
          100% {
            transform:
              translateY(0);
          }

          50% {
            transform:
              translateY(-9px);
          }
        }

        /* =====================================================
           FLOATING CARDS
        ===================================================== */

        .feature-card {
          position: absolute;

          width: 220px;

          padding: 18px;

          display: flex;

          gap: 13px;

          align-items: flex-start;

          background:
            rgba(255, 255, 255, 0.94);

          backdrop-filter: blur(15px);

          border:
            1px solid #e3ebf6;

          border-radius: 18px;

          box-shadow:
            0 15px 40px
            rgba(32, 75, 130, 0.11);

          z-index: 20;

          transition:
            0.35s ease;
        }

        .feature-card:hover {
          transform:
            translateY(-6px)
            scale(1.02);

          border-color:
            #a8ceff;

          box-shadow:
            0 20px 50px
            rgba(32, 105, 210, 0.17);
        }

        .feature-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              #eef7ff,
              #dcecff
            );

          font-size: 21px;
        }

        .feature-card h3 {
          font-size: 14px;

          color: #101828;

          margin-bottom: 5px;
        }

        .feature-card p {
          font-size: 11px;

          line-height: 1.5;

          color: #667085;
        }

        .ai-card {
          top: 110px;
          right: 5px;
        }

        .roadmap-card {
          top: 355px;
          right: -30px;
        }

        .degree-card {
          left: 0;
          bottom: 165px;
        }

        .university-card {
          left: 45px;
          bottom: 35px;
        }

        /* =====================================================
           STATS
        ===================================================== */

        .stats-section {
          padding: 0 6%;

          position: relative;

          z-index: 30;
        }

        .stats-container {
          max-width: 1200px;

          margin: auto;

          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          padding: 32px 20px;

          background:
            rgba(255, 255, 255, 0.95);

          border:
            1px solid #e7eef7;

          border-radius: 24px;

          box-shadow:
            0 25px 70px
            rgba(31, 79, 130, 0.08);
        }

        .stat {
          text-align: center;

          position: relative;
        }

        .stat:not(:last-child)::after {
          content: "";

          position: absolute;

          width: 1px;

          height: 60px;

          right: 0;

          top: 50%;

          transform:
            translateY(-50%);

          background: #e5eaf1;
        }

        .stat-icon {
          color: #147df5;

          font-size: 23px;

          margin-bottom: 8px;
        }

        .stat-number {
          font-size: 30px;

          font-weight: 800;

          color: #147df5;

          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 13px;

          color: #475467;
        }

        /* =====================================================
           SECTION
        ===================================================== */

        .section-heading {
          text-align: center;

          max-width: 700px;

          margin:
            0 auto 60px;
        }

        .section-label {
          font-size: 11px;

          letter-spacing: 2px;

          font-weight: 800;

          color: #1677ff;
        }

        .section-heading h2 {
          font-size: 52px;

          letter-spacing: -2px;

          margin:
            13px 0 17px;

          color: #101828;
        }

        .section-heading h2 span {
          color: #1677ff;
        }

        .section-heading p {
          color: #667085;

          line-height: 1.7;

          font-size: 17px;
        }

        /* =====================================================
           CAREERS
        ===================================================== */

        .careers-section {
          padding:
            140px 7%
            130px;

          background:
            linear-gradient(
              180deg,
              #ffffff,
              #f7fbff
            );
        }

        .career-grid {
          max-width: 1200px;

          margin: auto;

          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 22px;
        }

        .career-card {
          padding: 28px;

          border:
            1px solid #e4ebf4;

          border-radius: 22px;

          background: white;

          transition:
            0.3s ease;

          box-shadow:
            0 10px 30px
            rgba(16, 56, 100, 0.04);

          position: relative;
          overflow: hidden;
        }

        .career-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #1677ff, #0958d9);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .career-card:hover::before {
          opacity: 1;
        }

        .career-card:hover {
          transform:
            translateY(-8px);

          border-color:
            #a7ceff;

          box-shadow:
            0 25px 50px
            rgba(36, 110, 210, 0.15);
        }

        /* Category-specific card colors */
        .career-card[data-category="Technology"]::before {
          background: linear-gradient(135deg, #1677ff, #0958d9);
        }

        .career-card[data-category="Technology"] .career-icon {
          background: linear-gradient(135deg, #edf6ff, #dbeafe);
        }

        .career-card[data-category="Healthcare"]::before {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }

        .career-card[data-category="Healthcare"] .career-icon {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
        }

        .career-card[data-category="Engineering"]::before {
          background: linear-gradient(135deg, #f97316, #ea580c);
        }

        .career-card[data-category="Engineering"] .career-icon {
          background: linear-gradient(135deg, #ffedd5, #fed7aa);
        }

        .career-card[data-category="Business"]::before {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .career-card[data-category="Business"] .career-icon {
          background: linear-gradient(135deg, #faf5ff, #f3e8ff);
        }

        .career-card[data-category="Arts"]::before {
          background: linear-gradient(135deg, #ec4899, #db2777);
        }

        .career-card[data-category="Arts"] .career-icon {
          background: linear-gradient(135deg, #fce7f3, #fbcfe8);
        }

        .career-card[data-category="Science"]::before {
          background: linear-gradient(135deg, #14b8a6, #0d9488);
        }

        .career-card[data-category="Science"] .career-icon {
          background: linear-gradient(135deg, #f0fdfa, #ccfbf1);
        }

        .career-card[data-category="Education"]::before {
          background: linear-gradient(135deg, #eab308, #ca8a04);
        }

        .career-card[data-category="Education"] .career-icon {
          background: linear-gradient(135deg, #fefce8, #fef9c3);
        }

        .career-card[data-category="Legal"]::before {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
        }

        .career-card[data-category="Legal"] .career-icon {
          background: linear-gradient(135deg, #eef2ff, #e0e7ff);
        }

        .career-card[data-category="Finance"]::before {
          background: linear-gradient(135deg, #059669, #047857);
        }

        .career-card[data-category="Finance"] .career-icon {
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
        }

        .career-card[data-category="Media"]::before {
          background: linear-gradient(135deg, #f43f5e, #e11d48);
        }

        .career-card[data-category="Media"] .career-icon {
          background: linear-gradient(135deg, #ffe4e6, #fecdd3);
        }

        .career-card[data-category="Trades"]::before {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .career-card[data-category="Trades"] .career-icon {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
        }

        .career-card[data-category="Hospitality"]::before {
          background: linear-gradient(135deg, #84cc16, #65a30d);
        }

        .career-card[data-category="Hospitality"] .career-icon {
          background: linear-gradient(135deg, #ecfccb, #d9f99d);
        }

        .career-card[data-category="Design"]::before {
          background: linear-gradient(135deg, #a855f7, #9333ea);
        }

        .career-card[data-category="Design"] .career-icon {
          background: linear-gradient(135deg, #faf5ff, #f3e8ff);
        }

        .career-card[data-category="Aviation"]::before {
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
        }

        .career-card[data-category="Aviation"] .career-icon {
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
        }

        .career-card[data-category="Social Services"]::before {
          background: linear-gradient(135deg, #f97316, #ea580c);
        }

        .career-card[data-category="Social Services"] .career-icon {
          background: linear-gradient(135deg, #ffedd5, #fed7aa);
        }

        .career-card[data-category="Public Service"]::before {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .career-card[data-category="Public Service"] .career-icon {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
        }

        .career-card[data-category="Agriculture"]::before {
          background: linear-gradient(135deg, #65a30d, #4d7c0f);
        }

        .career-card[data-category="Agriculture"] .career-icon {
          background: linear-gradient(135deg, #ecfccb, #bef264);
        }

        .career-icon {
          width: 60px;
          height: 60px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 17px;

          background: #edf6ff;

          font-size: 29px;

          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .career-card:hover .career-icon {
          transform: scale(1.1);
        }

        .career-card h3 {
          font-size: 19px;

          margin-bottom: 10px;
          color: #1a1a1a;
          font-weight: 600;
        }

        .career-card .category-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 12px;
          background: #f5f5f5;
          color: #666;
        }

        .career-card p {
          font-size: 13px;

          color: #1677ff;
          font-weight: 500;
        }

        /* Search and Filter Styles */
        .search-container {
          max-width: 1200px;
          margin: 0 auto 40px;
        }

        .search-input {
          width: 100%;
          padding: 16px 20px 16px 50px;
          font-size: 16px;
          border: 2px solid #e4ebf4;
          border-radius: 12px;
          background: white;
          transition: all 0.3s ease;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%231677ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: 15px center;
          background-size: 20px;
        }

        .search-input:focus {
          outline: none;
          border-color: #1677ff;
          box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.1);
        }

        .search-input::placeholder {
          color: #999;
        }

        .filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }

        .filter-button {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          border: 2px solid #e4ebf4;
          border-radius: 25px;
          background: white;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-button:hover {
          border-color: #1677ff;
          color: #1677ff;
          background: #edf6ff;
        }

        .filter-button.active {
          background: linear-gradient(135deg, #1677ff, #0958d9);
          color: white;
          border-color: #1677ff;
          box-shadow: 0 4px 15px rgba(22, 119, 255, 0.3);
        }

        /* Modal Styles */
        .job-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .job-modal {
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          padding: 30px;
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .job-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .job-modal-title {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .job-modal-icon {
          font-size: 48px;
        }

        .job-modal-name {
          font-size: 24px;
          font-weight: bold;
          color: #1a1a1a;
        }

        .job-modal-category {
          font-size: 14px;
          color: #1677ff;
          font-weight: 500;
        }

        .job-modal-close {
          font-size: 32px;
          color: #999;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .job-modal-close:hover {
          background: #f5f5f5;
          color: #333;
        }

        .job-modal-description {
          font-size: 16px;
          line-height: 1.6;
          color: #555;
          margin-bottom: 24px;
        }

        .job-modal-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 24px;
        }

        .job-modal-stat {
          padding: 16px;
          border-radius: 12px;
        }

        .job-modal-stat-blue {
          background: #edf6ff;
        }

        .job-modal-stat-green {
          background: #f0fdf4;
        }

        .job-modal-stat-purple {
          background: #faf5ff;
          grid-column: span 2;
        }

        .job-modal-stat-label {
          font-size: 13px;
          color: #666;
          margin-bottom: 5px;
        }

        .job-modal-stat-value {
          font-size: 20px;
          font-weight: bold;
        }

        .job-modal-stat-blue .job-modal-stat-value {
          color: #1677ff;
        }

        .job-modal-stat-green .job-modal-stat-value {
          color: #22c55e;
        }

        .job-modal-stat-purple .job-modal-stat-value {
          color: #9333ea;
        }

        .job-modal-section {
          margin-bottom: 24px;
        }

        .job-modal-section-title {
          font-size: 16px;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        .job-modal-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .job-modal-tag {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
        }

        .job-modal-tag-gray {
          background: #f5f5f5;
          color: #666;
        }

        .job-modal-tag-blue {
          background: #edf6ff;
          color: #1677ff;
        }

        .job-modal-button {
          width: 100%;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #1677ff, #f97316);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .job-modal-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(22, 119, 255, 0.3);
        }

        /* =====================================================
           AI SECTION
        ===================================================== */

        .ai-section {
          padding:
            130px 7%;

          background:
            #ffffff;
        }

        .ai-container {
          max-width: 1150px;

          margin: auto;

          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 90px;

          align-items: center;
        }

        .ai-visual {
          display: flex;

          justify-content: center;

          align-items: center;

          height: 450px;
        }

        .ai-circle {
          width: 310px;
          height: 310px;

          border-radius: 50%;

          display: flex;

          align-items: center;
          justify-content: center;

          position: relative;

          background:
            radial-gradient(
              circle,
              #e8f4ff,
              #cce5ff 45%,
              #eef7ff
            );

          box-shadow:
            0 0 80px
            rgba(38, 130, 255, 0.18);
        }

        .ai-core {
          width: 120px;
          height: 120px;

          border-radius: 50%;

          display: flex;

          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              135deg,
              #087cff,
              #7c3aed
            );

          color: white;

          font-size: 35px;

          font-weight: 900;

          box-shadow:
            0 15px 40px
            rgba(37, 99, 235, 0.3);
        }

        .orbit {
          position: absolute;

          border:
            1px solid #7eb8ff;

          border-radius: 50%;

          animation:
            orbit
            8s linear
            infinite;
        }

        .orbit-1 {
          width: 390px;
          height: 150px;

          transform:
            rotate(30deg);
        }

        .orbit-2 {
          width: 150px;
          height: 390px;

          transform:
            rotate(30deg);

          animation-direction:
            reverse;
        }

        @keyframes orbit {

          from {
            transform:
              rotate(0deg)
              rotateX(60deg);
          }

          to {
            transform:
              rotate(360deg)
              rotateX(60deg);
          }
        }

        .ai-content h2 {
          font-size: 52px;

          letter-spacing: -2px;

          line-height: 1.05;

          margin:
            15px 0 25px;
        }

        .ai-content h2 span {
          color: #1677ff;
        }

        .ai-content > p {
          font-size: 17px;

          color: #667085;

          line-height: 1.7;

          margin-bottom: 25px;
        }

        .ai-list {
          display: flex;

          flex-direction: column;

          gap: 14px;

          margin-bottom: 30px;
        }

        .ai-list div {
          color: #344054;

          font-size: 14px;
        }

        .ai-list span {
          display: inline-flex;

          width: 22px;
          height: 22px;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #e9f5ff;

          color: #1677ff;

          margin-right: 10px;
        }

        /* =====================================================
           ROADMAP
        ===================================================== */

        .roadmap-section {
          padding:
            140px 7%;

          background:
            linear-gradient(
              180deg,
              #f8fbff,
              #ffffff
            );
        }

        .roadmap {
          max-width: 1100px;

          margin: auto;

          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 30px;

          position: relative;
        }

        .roadmap-line {
          position: absolute;

          top: 32px;

          left: 10%;

          right: 10%;

          height: 2px;

          background:
            linear-gradient(
              90deg,
              #b6d9ff,
              #1677ff,
              #b6d9ff
            );
        }

        .roadmap-step {
          position: relative;

          text-align: center;

          z-index: 2;
        }

        .step-number {
          width: 65px;
          height: 65px;

          margin:
            0 auto 25px;

          border-radius: 50%;

          display: flex;

          align-items: center;
          justify-content: center;

          background: white;

          border:
            2px solid #82bfff;

          color: #1677ff;

          font-weight: 800;

          box-shadow:
            0 8px 25px
            rgba(37, 99, 235, 0.12);
        }

        .roadmap-step h3 {
          font-size: 17px;

          margin-bottom: 10px;
        }

        .roadmap-step p {
          color: #667085;

          font-size: 13px;

          line-height: 1.6;
        }

        /* =====================================================
           UNIVERSITIES
        ===================================================== */

        .universities-section {
          padding:
            80px 6%;

          text-align: center;

          background: white;

          border-top:
            1px solid #edf2f7;
        }

        .universities-section > p {
          color: #98a2b3;

          font-size: 11px;

          letter-spacing: 2px;

          font-weight: 700;

          margin-bottom: 40px;
        }

        .university-list {
          max-width: 1150px;

          margin: auto;

          display: flex;

          justify-content:
            space-between;

          align-items: center;

          gap: 25px;

          flex-wrap: wrap;
        }

        .university {
          color: #475467;

          font-size: 13px;

          font-weight: 600;

          display: flex;

          align-items: center;

          gap: 8px;
        }

        .university-symbol {
          color: #1677ff;

          font-size: 22px;
        }

        /* =====================================================
           CTA
        ===================================================== */

        .cta-section {
          padding:
            120px 7%;

          background:
            radial-gradient(
              circle at 50% 100%,
              #dcecff,
              transparent 55%
            ),
            #f8fbff;

          text-align: center;
        }

        .cta-content {
          max-width: 700px;

          margin: auto;
        }

        .cta-content h2 {
          font-size: 58px;

          letter-spacing: -3px;

          margin:
            15px 0;
        }

        .cta-content p {
          font-size: 18px;

          color: #667085;

          line-height: 1.7;

          margin-bottom: 30px;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        footer {
          padding:
            50px 7% 25px;

          background: #f8fafc;

          text-align: center;

          border-top:
            1px solid #e8eef5;
        }

        .footer-logo {
          font-size: 25px;

          font-weight: 800;

          margin-bottom: 10px;
        }

        .footer-logo span {
          color: #1677ff;
        }

        footer p {
          color: #667085;

          font-size: 13px;

          margin-bottom: 30px;
        }

        .footer-bottom {
          padding-top: 20px;

          border-top:
            1px solid #e5eaf0;

          color: #98a2b3;

          font-size: 12px;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1100px) {

          .navbar nav {
            gap: 18px;
          }

          .hero-container {
            grid-template-columns: 1fr;
          }

          .hero-content {
            text-align: center;

            padding:
              80px 20px 0;
          }

          .hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions {
            justify-content: center;
          }

          .hero-visual {
            height: 600px;
          }

          .career-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .ai-container {
            grid-template-columns: 1fr;
          }

          .roadmap {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .roadmap-line {
            display: none;
          }
        }

        @media (max-width: 750px) {

          .navbar {
            padding: 0 20px;
          }

          .navbar nav {
            display: none;
          }

          .nav-button {
            padding: 10px 15px;
          }

          .hero h1 {
            font-size: 58px;

            letter-spacing: -3px;
          }

          .hero-visual {
            height: 540px;
          }

          .student-wrapper {
            width: 340px;
          }

          .feature-card {
            width: 175px;
          }

          .feature-card p {
            display: none;
          }

          .ai-card {
            right: 0;
            top: 80px;
          }

          .roadmap-card {
            right: -10px;
            top: 300px;
          }

          .degree-card {
            left: 0;
            bottom: 130px;
          }

          .university-card {
            left: 10px;
            bottom: 25px;
          }

          .stats-container {
            grid-template-columns:
              repeat(2, 1fr);

            gap: 30px;
          }

          .stat:nth-child(2)::after {
            display: none;
          }

          .career-grid {
            grid-template-columns: 1fr;
          }

          .section-heading h2,
          .ai-content h2 {
            font-size: 40px;
          }

          .roadmap {
            grid-template-columns: 1fr;
          }

          .university-list {
            justify-content: center;
          }

          .cta-content h2 {
            font-size: 43px;
          }

          .hero-actions {
            flex-direction: column;
          }
        }

      `}</style>

      <div className="dream-degree">

        {/* ===================================================
            NAVBAR
        =================================================== */}

        {(
          <header className="navbar">

          <div className="logo">

            <div className="logo-symbol">
              D
            </div>

            <div>

              <div className="logo-name">
                Dream Degree<span> Advisor</span>
              </div>

              <div className="logo-subtitle">
                AI FUTURE GOAL GUIDE
              </div>

            </div>

          </div>

          <nav>

            <a
              href="#home"
              className="active"
            >
              Home
            </a>

            <a href="#careers">
              Explore Future Goals
            </a>

            <a href="#ai">
              AI Guidance
            </a>

            {/* <a href="#roadmap">
              Roadmap
            </a>

            <a href="#about">
              About Us
            </a> */}

          </nav>

          {/* Language Switcher */}
          <div className="language-switcher">
            <button
              onClick={() => changeLanguage('en')}
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('si')}
              className={`lang-btn ${language === 'si' ? 'active' : ''}`}
            >
              සිං
            </button>
            <button
              onClick={() => changeLanguage('ta')}
              className={`lang-btn ${language === 'ta' ? 'active' : ''}`}
            >
              தமி
            </button>
          </div>

          {/* Portal Button */}
          <div ref={portalRef} style={{ position: 'relative' }}>
            <button className={`portal-btn ${portalOpen ? 'active' : ''}`} onClick={() => setPortalOpen(!portalOpen)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
              </svg>
              Portal
            </button>

            {portalOpen && (
              <div className="portal-dropdown">
                {/* Header */}
                <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #eff6ff, #fff7ed)' }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 7, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 900 }}>D</span>
                    Navigation
                  </p>
                </div>
                <div style={{ padding: '6px 0' }}>
                  {onNavigateToDashboard && (
                    <button className="portal-dropdown-item" onClick={() => { setPortalOpen(false); onNavigateToDashboard(); }}>
                      <span className="portal-dropdown-icon" style={{ background: '#eff6ff' }}>
                        <svg width="16" height="16" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      </span>
                      Dashboard
                    </button>
                  )}
                  {onViewProfile && (
                    <button className="portal-dropdown-item" onClick={() => { setPortalOpen(false); onViewProfile(); }}>
                      <span className="portal-dropdown-icon" style={{ background: '#fff7ed' }}>
                        <svg width="16" height="16" fill="none" stroke="#f97316" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </span>
                      My Profile
                    </button>
                  )}
                  <button className="portal-dropdown-item" onClick={() => { setPortalOpen(false); onStart(); }}>
                    <span className="portal-dropdown-icon" style={{ background: '#f0fdf4' }}>
                      <svg width="16" height="16" fill="none" stroke="#22c55e" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </span>
                    New Analysis
                  </button>
                </div>
              </div>
            )}
          </div>

          {onLogout && authUser ? (
            <div ref={avatarRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: 'white', fontSize: 20, fontWeight: 800,
                  border: '3px solid #e0e7ff',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.30)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.25s ease', position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(59,130,246,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.30)'; }}
              >
                {authUser.displayName ? authUser.displayName.charAt(0).toUpperCase()
                  : authUser.email ? authUser.email.charAt(0).toUpperCase() : '?'}
                {/* Online dot */}
                <span style={{
                  position: 'absolute', bottom: 0, right: 0, width: 12, height: 12,
                  background: '#22c55e', borderRadius: '50%', border: '2px solid white',
                }} />
              </button>

              {/* Avatar Dropdown */}
              {avatarOpen && (
                <div style={{
                  position: 'absolute', top: 56, right: 0, width: 260,
                  background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
                  borderRadius: 16, border: '1px solid #e5e7eb',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.06)',
                  zIndex: 1000, overflow: 'hidden',
                  animation: 'avatarDropIn 0.2s ease-out',
                }}>
                  <style>{`@keyframes avatarDropIn { from { opacity: 0; transform: translateY(-8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
                  {/* User header */}
                  <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: 16,
                      }}>
                        {authUser.displayName ? authUser.displayName.charAt(0).toUpperCase()
                          : authUser.email ? authUser.email.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {authUser.displayName || 'Student'}
                        </p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {authUser.email || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Logout */}
                  <div style={{ padding: 6 }}>
                    <button onClick={() => { setAvatarOpen(false); onLogout(); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#ef4444', transition: 'background 0.15s', borderRadius: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span style={{ fontSize: 16 }}>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-button" onClick={onLogin}>
              {t.getStarted}
              <span>→</span>
            </button>
          )}

        </header>
        )}

        {/* ===================================================
            HERO
        =================================================== */}

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

        {/* ===================================================
            STATS
        =================================================== */}

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

        {/* ===================================================
            CAREERS
        =================================================== */}

        <section
          className="careers-section scroll-reveal"
          id="careers"
        >

          <div className="section-heading">

            <span className="section-label">
              EXPLORE YOUR POSSIBILITIES
            </span>

            <h2>
              Find a future goal that
              <span> fits you.</span>
            </h2>

            <p>
              Explore future goals and discover where your
              skills, interests and ambitions can take you.
            </p>

          </div>

          {/* Search and Filter Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            {/* Category Filter */}
            <div className="filter-buttons">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Job Description Modal */}
          {selectedJob && (
            <div className="job-modal-overlay" onClick={() => setSelectedJob(null)}>
              <div className="job-modal" onClick={(e) => e.stopPropagation()}>
                <div className="job-modal-header">
                  <div className="job-modal-title">
                    <span className="job-modal-icon">{selectedJob.icon}</span>
                    <div>
                      <h3 className="job-modal-name">{selectedJob.title}</h3>
                      <span className="job-modal-category">{selectedJob.category}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="job-modal-close">×</button>
                </div>
                
                <p className="job-modal-description">{selectedJob.description}</p>
                
                <div className="job-modal-stats">
                  <div className="job-modal-stat job-modal-stat-blue">
                    <p className="job-modal-stat-label">Market Demand</p>
                    <p className="job-modal-stat-value">{selectedJob.marketDemand}%</p>
                  </div>
                  <div className="job-modal-stat job-modal-stat-green">
                    <p className="job-modal-stat-label">Sustainability Score</p>
                    <p className="job-modal-stat-value">{selectedJob.sustainabilityScore}%</p>
                  </div>
                  <div className="job-modal-stat job-modal-stat-purple">
                    <p className="job-modal-stat-label">Average Salary</p>
                    <p className="job-modal-stat-value">{selectedJob.averageSalary}</p>
                  </div>
                </div>

                <div className="job-modal-section">
                  <h4 className="job-modal-section-title">Required Skills</h4>
                  <div className="job-modal-tags">
                    {selectedJob.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="job-modal-tag job-modal-tag-gray">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="job-modal-section">
                  <h4 className="job-modal-section-title">Required Qualifications</h4>
                  <div className="job-modal-tags">
                    {selectedJob.requiredQualifications.map((qual, idx) => (
                      <span key={idx} className="job-modal-tag job-modal-tag-blue">{qual}</span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedJob(null);
                    onStart();
                  }}
                  className="job-modal-button"
                >
                  Start Your Journey with {selectedJob.title}
                </button>
              </div>
            </div>
          )}

          <div className="career-grid scroll-reveal">

            {displayJobs.map((job) => (
              <div
                className="career-card cursor-pointer"
                key={job.id}
                data-category={job.category}
                onClick={() => setSelectedJob(job)}
              >

                <div className="career-icon">
                  {job.icon}
                </div>

                <span className="category-badge">{job.category}</span>

                <h3>
                  {job.title}
                </h3>

                <p>
                  Explore this future goal →
                </p>

                </div>

              )
            )}

          </div>

        </section>

        {/* ===================================================
            AI
        =================================================== */}

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

        {/* ===================================================
            ROADMAP
        =================================================== */}

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

        {/* ===================================================
            UNIVERSITIES
        =================================================== */}

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

        {/* ===================================================
            CTA
        =================================================== */}

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

        {/* ===================================================
            FOOTER
        =================================================== */}

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

      </div>
    </>
  );
}