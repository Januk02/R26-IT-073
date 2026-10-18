/**
 * Mentorship Page — Premium Redesign v2
 * Matches the existing StudentDashboard / Dream Degree Advisor design language
 * Dark hero banner, architectural cards, Framer Motion, medal images
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../src/contexts/AuthContext";
import { fetchMentorsFromFirestore } from "../services/mentorService";
import MentorMatchedStudents from "../components/MentorMatchedStudents";
import {
  Users,
  MapPin,
  GraduationCap,
  ChevronLeft,
  Sparkles,
  BookOpen,
  Award,
  BriefcaseBusiness,
  MessageSquare,
  ShieldCheck,
  Clock,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                 */
/* ═══════════════════════════════════════════════════════════ */
const MentorshipPage = ({ onBack, onOpenChat }) => {
  const { user, userRole } = useAuth();
  const isMentor = userRole === "mentor";
  const [verifiedMentors, setVerifiedMentors] = useState([]);
  const [mentorsLoading, setMentorsLoading] = useState(true);
  const [mentorsError, setMentorsError] = useState(null);

  const firstName =
    user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "User";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  useEffect(() => {
    if (isMentor) return undefined;

    let active = true;
    fetchMentorsFromFirestore()
      .then((mentors) => {
        if (!active) return;
        setVerifiedMentors(mentors.filter((mentor) => mentor.is_verified));
        setMentorsError(null);
      })
      .catch((fetchError) => {
        if (!active) return;
        setMentorsError("Could not load verified mentors right now.");
        console.error("Error loading verified mentors:", fetchError);
      })
      .finally(() => {
        if (active) setMentorsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isMentor]);

  /* ══════════════════════════════════════════════════════ */
  /*  RENDER                                               */
  /* ══════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        /* ══════════════════════════════════════════════════
           Mentorship Page — Matching StudentDashboard Style
           ══════════════════════════════════════════════════ */
        .mentor-root {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
          min-height: 100vh;
          background: #F8FAFC;
          color: #0F172A;
          padding-bottom: 80px;
        }

        /* ── Dark Hero Banner ── */
        .mentor-hero {
          position: relative;
          width: 100%;
          min-height: 320px;
          background: #0F172A;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .mentor-hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 35%;
          opacity: 0.5;
          transform: scale(1.01);
          transition: transform 8s ease;
          filter: blur(1px);
        }

        .mentor-hero:hover .mentor-hero-bg {
          transform: scale(1.04);
        }

        .mentor-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(15, 23, 42, 0.92) 0%,
            rgba(24, 57, 97, 0.75) 50%,
            rgba(15, 23, 42, 0.85) 100%
          );
        }

        .mentor-hero-content {
          position: relative;
          z-index: 2;
          max-width: 1380px;
          width: 100%;
          margin: 0 auto;
          padding: 48px 48px 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .hero-text h1 {
          font-size: 40px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.04em;
          line-height: 1.15;
          margin: 0 0 12px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }

        .hero-text p {
          font-size: 16px;
          color: rgba(255,255,255,0.78);
          margin: 0 0 24px;
          max-width: 520px;
          line-height: 1.6;
        }

        .hero-stats-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hero-stat-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 10px 16px;
          transition: all 0.3s ease;
        }

        .hero-stat-chip:hover {
          background: rgba(255,255,255,0.18);
          transform: translateY(-2px);
        }

        .hero-stat-chip .chip-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
        }

        .hero-stat-chip .chip-value {
          font-size: 22px;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1;
        }

        .hero-stat-chip .chip-label {
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .hero-illustration {
          flex-shrink: 0;
          width: 300px;
          height: 200px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          border: 2px solid rgba(255,255,255,0.1);
        }

        .hero-illustration img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* floating animated badges around illustration */
        .float-badge {
          position: absolute;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #0F172A;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          animation: floatBadge 3s ease-in-out infinite;
          z-index: 5;
        }

        .float-badge.badge-1 {
          top: -16px;
          right: -20px;
          animation-delay: 0s;
        }

        .float-badge.badge-2 {
          bottom: -12px;
          left: -24px;
          animation-delay: 1.5s;
        }

        .float-badge.badge-3 {
          top: 50%;
          right: -30px;
          transform: translateY(-50%);
          animation-delay: 0.8s;
        }

        .float-badge-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        }

        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* ── Back button ── */
        .mentor-back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mentor-back-btn:hover {
          background: rgba(255,255,255,0.2);
          transform: translateX(-3px);
        }

        /* ── Live badge ── */
        .live-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(16, 185, 129, 0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 20px;
          padding: 6px 14px;
          color: #34D399;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #34D399;
          animation: livePulse 2s ease-in-out infinite;
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); }
          50% { opacity: 0.6; box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
        }

        /* ── Body Content ── */
        .mentor-body {
          max-width: 1380px;
          margin: -36px auto 0;
          padding: 0 48px;
          position: relative;
          z-index: 3;
        }

        /* ── Filters Section ── */
        .filters-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 28px 28px 24px;
          margin-bottom: 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }

        .filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .filters-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filters-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #F0EDFF;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .filters-title {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
        }

        .filters-subtitle {
          font-size: 13px;
          color: #94A3B8;
          font-weight: 500;
        }

        .clear-filters-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #2563eb;
          background: #F5F3FF;
          border: 1px solid #dbeafe;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters-btn:hover {
          background: #EDE9FE;
          color: #1d438e;
        }

        .filters-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 12px;
        }

        .filter-input-wrap {
          position: relative;
        }

        .filter-input-wrap .input-icon {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          color: #94A3B8;
          pointer-events: none;
        }

        .filter-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          font-size: 14px;
          color: #0F172A;
          outline: none;
          transition: all 0.25s;
          box-sizing: border-box;
        }

        .filter-input:focus {
          border-color: #2563eb;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(36,85,179, 0.1);
        }

        .filter-select {
          width: 100%;
          padding: 12px 36px 12px 16px;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          font-size: 14px;
          color: #0F172A;
          outline: none;
          cursor: pointer;
          appearance: none;
          transition: all 0.25s;
          box-sizing: border-box;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394A3B8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 12px center;
          background-repeat: no-repeat;
          background-size: 18px;
        }

        .filter-select:focus {
          border-color: #2563eb;
          background-color: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(36,85,179, 0.1);
        }

        /* ── Student Cards Grid ── */
        .students-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }

        .mentor-student-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          min-height: 260px;
          padding: 24px 22px 20px;
          display: flex;
          flex-direction: column;
          cursor: default;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
        }

        .mentor-student-card:hover {
          transform: translateY(-6px);
          border-color: transparent;
          box-shadow: 0 20px 48px rgba(0,0,0,0.12);
        }

        .mentor-student-card .card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .student-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.35s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        .student-avatar span {
          font-size: 20px;
          font-weight: 800;
          color: #FFFFFF;
        }

        .mentor-student-card:hover .student-avatar {
          transform: rotate(5deg) scale(1.08);
        }

        .mentor-student-card .index-num {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #CBD5E1;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
        }

        .mentor-student-card .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .mentor-student-card .tag-line {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #2563eb;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .mentor-student-card .card-main-title {
          font-size: 17px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
          line-height: 1.25;
          margin-bottom: 12px;
        }

        .student-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #94A3B8;
        }

        .meta-text {
          font-size: 12px;
          color: #64748B;
        }

        .meta-text.truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 180px;
        }

        .al-row {
          margin-top: 4px;
        }

        .interest-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 10px;
        }

        .interest-pill {
          padding: 3px 9px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          border: 1px solid;
          white-space: nowrap;
        }

        .interest-pill-more {
          background: #F1F5F9 !important;
          color: #94A3B8 !important;
          border-color: #E2E8F0 !important;
        }

        /* ── Pagination ── */
        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
        }

        .pagination-info {
          font-size: 13px;
          color: #94A3B8;
          font-weight: 500;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .page-btn {
          min-width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          background: #FFFFFF;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0 10px;
        }

        .page-btn:hover:not(:disabled):not(.active) {
          border-color: #2563eb;
          color: #2563eb;
          background: #F5F3FF;
        }

        .page-btn.active {
          background: #2563eb;
          border-color: #2563eb;
          color: #FFFFFF;
          box-shadow: 0 4px 16px rgba(36,85,179, 0.3);
        }

        .page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* ── Empty States ── */
        .empty-state {
          text-align: center;
          padding: 64px 32px;
        }

        .empty-icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #F5F3FF;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: #c5dbff;
        }

        .empty-title {
          font-size: 16px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 6px;
        }

        .empty-desc {
          font-size: 14px;
          color: #94A3B8;
        }

        /* ── Loading skeletons ── */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .skeleton-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 24px;
          height: 260px;
        }

        .skeleton-line {
          border-radius: 8px;
          background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── ML Section Divider ── */
        .ml-section-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 40px 0 28px;
        }

        .ml-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #E2E8F0, transparent);
        }

        .ml-divider-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 20px;
          background: linear-gradient(135deg, #2563eb, #2455b3);
          color: white;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 20px rgba(36,85,179, 0.3);
        }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .students-grid, .skeleton-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-illustration { display: none; }
          .filters-row { grid-template-columns: 1fr; }
        }

        @media (max-width: 700px) {
          .students-grid, .skeleton-grid { grid-template-columns: 1fr; }
          .mentor-hero-content { padding: 36px 24px 44px; }
          .mentor-body { padding: 0 20px; }
          .hero-text h1 { font-size: 28px; }
          .hero-stats-row { flex-direction: column; }
          .filters-card { padding: 20px; }
        }
      `}</style>

      <div className="mentor-root">
        {/* ══════════ DARK HERO BANNER ══════════ */}
        <div className="mentor-hero">
          <img
            src="/mentor_hero.jpg"
            alt="AI Mentorship Matching"
            className="mentor-hero-bg"
          />
          <div className="mentor-hero-overlay" />

          {/* Back button */}
          <button className="mentor-back-btn" onClick={onBack}>
            <ChevronLeft size={20} strokeWidth={2.2} />
          </button>

          {/* Live badge */}
          <div className="live-badge">
            <span className="live-dot" />
            MENTORSHIP HUB
          </div>

          <div className="mentor-hero-content">
            <div className="hero-text">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {greeting}, {firstName}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                {isMentor
                  ? "Review students matched with you and open their shared profiles to understand their goals and background."
                  : "Connect with verified mentors and view your personalized mentor recommendations."}
              </motion.p>
            </div>

            {/* 3D Illustration with floating badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="hero-illustration"
            >
              <img src="/mentor_hero.jpg" alt="AI Mentorship" />

              {/* Floating badges */}
              <div className="float-badge badge-1">
                <div
                  className="float-badge-icon"
                  style={{ background: "#7C3AED" }}
                >
                  <Sparkles size={14} />
                </div>
                Matched students
              </div>
              <div className="float-badge badge-2">
                <div
                  className="float-badge-icon"
                  style={{ background: "#2563EB" }}
                >
                  <BookOpen size={14} />
                </div>
                11K+ Mentors
              </div>
              <div className="float-badge badge-3">
                <div
                  className="float-badge-icon"
                  style={{ background: "#059669" }}
                >
                  <Award size={14} />
                </div>
                Verified
              </div>
            </motion.div>
          </div>
        </div>

        {/* ══════════ BODY CONTENT ══════════ */}
        <div className="mentor-body">
          {!isMentor ? (
            <div className="filters-card">
              <h2 className="filters-title">Verified mentors</h2>
              <p className="filters-subtitle">
                Browse verified mentors by expertise and start a conversation
                directly.
              </p>
              {mentorsLoading ? (
                <div className="empty-state">Loading verified mentors...</div>
              ) : mentorsError ? (
                <div className="empty-state">{mentorsError}</div>
              ) : verifiedMentors.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon-circle">
                    <Users size={32} />
                  </div>
                  <div className="empty-title">
                    No verified mentors available
                  </div>
                  <div className="empty-desc">
                    Verified mentor profiles will appear here when available.
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 310px), 1fr))",
                    gap: 16,
                    marginTop: 20,
                  }}
                >
                  {verifiedMentors.map((mentor) => (
                    <article
                      key={mentor.uid || mentor.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #E2E8F0",
                        borderRadius: 12,
                        padding: 20,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 46,
                              height: 46,
                              flex: "0 0 46px",
                              borderRadius: 12,
                              background: mentor.color || "#0F766E",
                              color: "#fff",
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 800,
                            }}
                          >
                            {mentor.avatar || mentor.name?.[0] || "M"}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h3
                              style={{
                                margin: 0,
                                color: "#0F172A",
                                fontSize: 16,
                                fontWeight: 750,
                                overflowWrap: "anywhere",
                              }}
                            >
                              {mentor.name}
                            </h3>
                            <p
                              style={{
                                margin: "4px 0 0",
                                color: "#475569",
                                fontSize: 13,
                              }}
                            >
                              {mentor.industry_role || mentor.specialization}
                            </p>
                          </div>
                        </div>
                        <span
                          style={{
                            flexShrink: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "5px 8px",
                            background:
                              mentor.verification_level === "Silver"
                                ? "#F1F5F9"
                                : "#FEF3C7",
                            color:
                              mentor.verification_level === "Silver"
                                ? "#475569"
                                : "#92400E",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 750,
                          }}
                        >
                          <ShieldCheck size={13} /> {mentor.verification_level}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px 14px",
                          color: "#64748B",
                          fontSize: 12,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <BriefcaseBusiness size={13} />
                          {mentor.specialization || mentor.domain}
                        </span>
                        {mentor.university &&
                          mentor.university !== "University" && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <GraduationCap size={13} />
                              {mentor.university}
                            </span>
                          )}
                        {mentor.location &&
                          mentor.location !== "Not specified" && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <MapPin size={13} />
                              {mentor.location}
                            </span>
                          )}
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Clock size={13} />
                          {mentor.experience_years} yrs experience
                        </span>
                      </div>

                      {(mentor.oral_assessment_score !== null ||
                        mentor.cv_skill_audit_score !== null ||
                        mentor.overall_verification_score !== null) && (
                        <div
                          aria-label="Mentor verification scores"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: 8,
                            padding: 10,
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            borderRadius: 8,
                          }}
                        >
                          {[
                            ["AI Oral", mentor.oral_assessment_score],
                            ["CV & Skills", mentor.cv_skill_audit_score],
                            ["Overall", mentor.overall_verification_score],
                          ].map(([label, score]) => (
                            <div key={label} style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  color: "#64748B",
                                  fontSize: 10,
                                  fontWeight: 700,
                                }}
                              >
                                {label}
                              </div>
                              <div
                                style={{
                                  color:
                                    label === "Overall" ? "#0F766E" : "#0F172A",
                                  fontSize: 16,
                                  fontWeight: 800,
                                }}
                              >
                                {score === null ? "—" : `${Math.round(score)}%`}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {mentor.bio && (
                        <p
                          style={{
                            margin: 0,
                            color: "#475569",
                            fontSize: 13,
                            lineHeight: 1.5,
                          }}
                        >
                          {mentor.bio}
                        </p>
                      )}
                      {mentor.skills?.length > 0 && (
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                        >
                          {mentor.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              style={{
                                padding: "4px 8px",
                                background: "#F1F5F9",
                                color: "#334155",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          onOpenChat?.({
                            uid: mentor.uid || mentor.mentor_id || mentor.id,
                            id: mentor.id,
                            name: mentor.name,
                            field: mentor.specialization || mentor.domain,
                            email: mentor.email,
                          })
                        }
                        style={{
                          marginTop: "auto",
                          minHeight: 40,
                          display: "inline-flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 8,
                          border: 0,
                          borderRadius: 8,
                          background: "#0F766E",
                          color: "#fff",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <MessageSquare size={16} /> Start chat
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <MentorMatchedStudents />
          )}
        </div>
      </div>
    </>
  );
};

export default MentorshipPage;
