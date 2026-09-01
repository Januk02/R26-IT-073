import React, { useState, useRef, useEffect } from "react";
import hom2Image from "../../src/assets/hom2.png";
import { dreamJobs } from "../data/dreamDegreeData";
import { useLanguage } from "../../src/App";
import { translations } from "../data/languageTranslations";
import { useAuth } from "../../src/contexts/AuthContext";
import './DreamDegreeHome.css';

// ── Split components ──────────────────────────────
import DreamHomeNavbar from "../components/DreamHomeNavbar";
import DreamHomeHero from "../components/DreamHomeHero";
import DreamHomeCareers from "../components/DreamHomeCareers";
import { StatsSection, AISection, RoadmapSection, UniversitiesSection, CTASection, Footer } from "../components/DreamHomeSections";

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
    { icon: "🧠", title: t.aiGuidance, text: t.aiGuidanceDesc, className: "ai-card" },
    { icon: "⌘", title: t.roadmap, text: t.roadmapDesc, className: "roadmap-card" },
    { icon: "🎓", title: t.degreeMatch, text: t.degreeMatchDesc, className: "degree-card" },
    { icon: "🏛️", title: t.universityFinder, text: t.universityFinderDesc, className: "university-card" },
  ];

  const stats = [
    ["♧", "500+", "Future Goals Explored"],
    ["🎓", "1000+", "Students Guided"],
    ["🏆", "95%", "Success Rate"],
    ["☆", "4.9/5", "Student Rating"],
  ];

  const universities = [
    "University of Moratuwa", "University of Colombo",
    "SLIIT", "NSBM Green University", "IIT Sri Lanka", "UCSC Sri Lanka",
  ];

  return (
    <div className="dream-degree">

      {/* ── NAVBAR ── */}
      <DreamHomeNavbar
        onStart={onStart}
        onLogin={onLogin}
        onLogout={onLogout}
        onNavigateToDashboard={onNavigateToDashboard}
        onViewProfile={onViewProfile}
        language={language}
        changeLanguage={changeLanguage}
        t={t}
        portalOpen={portalOpen}
        setPortalOpen={setPortalOpen}
        portalRef={portalRef}
        avatarOpen={avatarOpen}
        setAvatarOpen={setAvatarOpen}
        avatarRef={avatarRef}
        authUser={authUser}
      />

      {/* ── HERO ── */}
      <DreamHomeHero onStart={onStart} features={features} hom2Image={hom2Image} />

      {/* ── STATS ── */}
      <StatsSection stats={stats} />

      {/* ── CAREERS ── */}
      <DreamHomeCareers
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        displayJobs={displayJobs}
        selectedJob={selectedJob}
        setSelectedJob={setSelectedJob}
        onStart={onStart}
        t={t}
      />

      {/* ── AI ── */}
      <AISection onLogin={onLogin} />

      {/* ── ROADMAP ── */}
      <RoadmapSection />

      {/* ── UNIVERSITIES ── */}
      <UniversitiesSection universities={universities} />

      {/* ── CTA ── */}
      <CTASection onStart={onStart} onLogin={onLogin} onLogout={onLogout} />

      {/* ── FOOTER ── */}
      <Footer />

    </div>
  );
}
