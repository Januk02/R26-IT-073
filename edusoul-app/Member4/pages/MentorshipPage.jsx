/**
 * Mentorship Page — Premium Redesign v2
 * Matches the existing StudentDashboard / Dream Degree Advisor design language
 * Dark hero banner, architectural cards, Framer Motion, medal images
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../src/contexts/AuthContext';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../src/firebase';
import MentorshipMatching from '../components/MentorshipMatching';
import {
  Users,
  Search,
  MapPin,
  Mail,
  Heart,
  GraduationCap,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Award,
} from 'lucide-react';

/* ───── animation variants ───── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

/* colour palette for avatar gradients */
const GRADIENTS = [
  'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
  'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
  'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
  'linear-gradient(135deg, #D97706 0%, #EA580C 100%)',
  'linear-gradient(135deg, #E11D48 0%, #EC4899 100%)',
  'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
  'linear-gradient(135deg, #DB2777 0%, #9333EA 100%)',
];

const INTEREST_COLORS = [
  { bg: '#EDE9FE', text: '#6D28D9', border: '#DDD6FE' },
  { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' },
  { bg: '#D1FAE5', text: '#047857', border: '#A7F3D0' },
  { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  { bg: '#FCE7F3', text: '#BE185D', border: '#FBCFE8' },
];

/* ═══════════════════════════════════════════════════════════ */
/*  Student Card — Architectural Interactive Card             */
/* ═══════════════════════════════════════════════════════════ */
const StudentCard = ({ student, index }) => {
  const hash = (student.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const gradient = GRADIENTS[hash % GRADIENTS.length];

  const interests = (() => {
    let ints = student.interests || [];
    if (typeof ints === 'object' && !Array.isArray(ints)) ints = Object.values(ints);
    return Array.isArray(ints) ? ints : [];
  })();

  return (
    <motion.div
      variants={fadeUp}
      className="mentor-student-card"
      style={{ '--card-hover-bg': gradient }}
    >
      {/* Top: avatar + field */}
      <div className="card-head">
        <div className="student-avatar" style={{ background: gradient }}>
          <span>{(student.name || '?').charAt(0).toUpperCase()}</span>
        </div>
        <span className="index-num">#{String(index + 1).padStart(2, '0')}</span>
      </div>

      {/* Body */}
      <div className="card-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
          <span className="tag-line">{student.stream || student.field_of_study || 'General'}</span>
          {student.major && student.stream && student.major.toLowerCase() !== student.stream.toLowerCase() && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#F3E8FF',
                color: '#7E22CE',
                border: '1px solid #E9D5FF'
              }}
            >
              {student.major}
            </span>
          )}
        </div>
        <div className="card-main-title">{student.name}</div>

        <div className="student-meta">
          <div className="meta-row">
            <Mail size={13} strokeWidth={1.8} />
            <span className="meta-text truncate">{student.email || '—'}</span>
          </div>
          <div className="meta-row">
            <MapPin size={13} strokeWidth={1.8} />
            <span className="meta-text">{student.location || 'Not specified'}</span>
          </div>
        </div>

        {/* Interest pills */}
        {interests.length > 0 && (
          <div className="interest-pills">
            {interests.slice(0, 3).map((int, i) => {
              const c = INTEREST_COLORS[i % INTEREST_COLORS.length];
              return (
                <span
                  key={i}
                  className="interest-pill"
                  style={{ background: c.bg, color: c.text, borderColor: c.border }}
                >
                  {int}
                </span>
              );
            })}
            {interests.length > 3 && (
              <span className="interest-pill interest-pill-more">+{interests.length - 3}</span>
            )}
          </div>
        )}

        {/* AL results */}
        {student.al_results && Object.keys(student.al_results).length > 0 && (() => {
          const subjects = Object.entries(student.al_results)
            .filter(([k, v]) => v && typeof v === 'string' && v.length <= 2 && k !== 'stream' && k !== 'zScore')
            .slice(0, 3);
          if (subjects.length === 0) return null;
          return (
            <div className="meta-row al-row">
              <Award size={13} strokeWidth={1.8} />
              <span className="meta-text">
                AL: {subjects.map(([s, g]) => `${s} ${g}`).join(', ')}
              </span>
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                 */
/* ═══════════════════════════════════════════════════════════ */
const MentorshipPage = ({ onBack }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(9);

  const [allFields, setAllFields] = useState([]);
  const [allLocations, setAllLocations] = useState([]);

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  /* ── Fetch students ── */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        const unifiedMap = new Map();
        const cleanStr = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        const addOrMergeDoc = (docId, rawData, source) => {
          if (!rawData) return;
          // Skip mentors from users collection
          if (source === 'users' && rawData.role === 'mentor') return;

          const emailKey = (rawData.email || '').toLowerCase().trim();
          const uidKey = rawData.uid || rawData.userId;
          const rawName = rawData.name || rawData.fullName || rawData.studentName || rawData.profile?.name || rawData.profile?.fullName || '';
          const nameKey = cleanStr(rawName);
          const docIdName = cleanStr(docId.replace(/_\d{10,}$/, ''));
          const emailPrefix = emailKey ? cleanStr(emailKey.split('@')[0]) : '';

          // Find if we already have this user in the map by UID, Email, Name, or DocID
          let target = null;
          if (uidKey && unifiedMap.has(uidKey)) {
            target = unifiedMap.get(uidKey);
          } else if (emailKey && unifiedMap.has(emailKey)) {
            target = unifiedMap.get(emailKey);
          } else if (nameKey && unifiedMap.has(`name_${nameKey}`)) {
            target = unifiedMap.get(`name_${nameKey}`);
          } else if (docIdName && docIdName.length > 2 && unifiedMap.has(`name_${docIdName}`)) {
            target = unifiedMap.get(`name_${docIdName}`);
          } else if (emailPrefix && emailPrefix.length > 2 && unifiedMap.has(`name_${emailPrefix}`)) {
            target = unifiedMap.get(`name_${emailPrefix}`);
          }

          const targetObj = target || { id: docId };

          // Deep merge all properties
          Object.assign(targetObj, {
            ...rawData,
            id: targetObj.id || docId,
            name: targetObj.name || rawName || rawData.name,
            email: targetObj.email || rawData.email,
            locationPreference: targetObj.locationPreference || rawData.locationPreference || rawData.location,
            stream: targetObj.stream || rawData.stream || rawData.Stream || rawData.alStream || rawData.alResults?.stream || rawData.academicResults?.stream,
            profile: { ...(targetObj.profile || {}), ...(rawData.profile || {}) },
            alResults: { ...(targetObj.alResults || {}), ...(rawData.alResults || {}) },
            academicResults: { ...(targetObj.academicResults || {}), ...(rawData.academicResults || {}) },
            interests: (rawData.interests && rawData.interests.length > 0) ? rawData.interests : (targetObj.interests || []),
            careerAspirations: (rawData.careerAspirations && rawData.careerAspirations.length > 0) ? rawData.careerAspirations : (targetObj.careerAspirations || []),
          });

          // Index by multiple keys for cross-collection matching
          if (uidKey) unifiedMap.set(uidKey, targetObj);
          if (emailKey) unifiedMap.set(emailKey, targetObj);
          if (nameKey) unifiedMap.set(`name_${nameKey}`, targetObj);
          if (docIdName && docIdName.length > 2) unifiedMap.set(`name_${docIdName}`, targetObj);
          if (emailPrefix && emailPrefix.length > 2) unifiedMap.set(`name_${emailPrefix}`, targetObj);
          unifiedMap.set(docId, targetObj);
        };

        const collectionsToFetch = [
          'students',
          'assessmentResults',
          'assessments',
          'users',
          'mentees',
          'recommendations',
          'student_recommendations',
          'career_assessments',
        ];

        for (const collName of collectionsToFetch) {
          try {
            const snap = await getDocs(query(collection(db, collName)));
            if (!snap.empty) {
              snap.forEach((d) => addOrMergeDoc(d.id, d.data(), collName));
              console.log(`✅ Loaded ${snap.size} docs from '${collName}'`);
            }
          } catch (e) {
            // collection might not exist or be restricted
          }
        }

        // Extract distinct student objects
        const uniqueDocs = Array.from(new Set(unifiedMap.values()));

        const formatNameFromEmail = (email) => {
          if (!email) return 'Student';
          const prefix = email.split('@')[0];
          const words = prefix.replace(/\d+$/, '').split(/[._-]+/).filter(Boolean);
          if (words.length > 0) {
            return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          }
          return prefix.charAt(0).toUpperCase() + prefix.slice(1);
        };

        const parseArrayField = (field) => {
          if (!field) return [];
          if (Array.isArray(field)) return field;
          if (typeof field === 'object') return Object.values(field);
          return [];
        };

        const studentsData = uniqueDocs.map((data, idx) => {
          // Robust Name Resolution
          const resolvedName =
            data.name ||
            data.fullName ||
            data.displayName ||
            data.studentName ||
            data.profile?.name ||
            data.profile?.fullName ||
            data.profile?.displayName ||
            (data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : null) ||
            (data.profile?.firstName ? `${data.profile.firstName} ${data.profile.lastName || ''}`.trim() : null) ||
            formatNameFromEmail(data.email);

          // Combined subjects from academicResults.subjects and alResults
          const combinedSubjects = {
            ...(data.academicResults?.subjects || {}),
            ...(data.alResults?.subjects || {}),
            ...(data.alResults || {}),
            ...(data.subjects || {}),
          };

          // Subject-based stream inference fallback
          let inferredStream = null;
          if (
            combinedSubjects.biology || combinedSubjects.Biology ||
            combinedSubjects['Agricultural Science'] || combinedSubjects.agriculture ||
            combinedSubjects.botany || combinedSubjects.zoology
          ) {
            inferredStream = 'Biological Science';
          } else if (
            combinedSubjects.combinedMathematics || combinedSubjects.combinedMaths ||
            combinedSubjects['Combined Mathematics'] || combinedSubjects.higherMaths
          ) {
            inferredStream = 'Physical Science';
          } else if (
            combinedSubjects.accounting || combinedSubjects.Accounting ||
            combinedSubjects.businessStudies || combinedSubjects['Business Studies'] ||
            combinedSubjects.economics || combinedSubjects.Economics
          ) {
            inferredStream = 'Commerce';
          } else if (
            combinedSubjects.engineeringTechnology || combinedSubjects.biosystemsTechnology ||
            combinedSubjects.sft || combinedSubjects.ict || combinedSubjects.ICT
          ) {
            inferredStream = 'Technology';
          } else if (
            combinedSubjects.sinhala || combinedSubjects.tamil ||
            combinedSubjects.englishLit || combinedSubjects.history || combinedSubjects.geography
          ) {
            inferredStream = 'Arts';
          }

          // Stream & Major Resolution
          const resolvedStream =
            data.academicResults?.stream ||
            data.academicResults?.Stream ||
            data.alResults?.stream ||
            data.alResults?.Stream ||
            data.stream ||
            data.Stream ||
            data.alStream ||
            data.ALStream ||
            data.profile?.stream ||
            data.profile?.Stream ||
            data.streamName ||
            data.subjectStream ||
            inferredStream ||
            null;

          const resolvedMajor =
            data.profile?.major ||
            data.profile?.Major ||
            data.major ||
            data.Major ||
            data.field_of_study ||
            data.fieldOfStudy ||
            data.degree ||
            data.degreeName ||
            data.course ||
            data.profile?.field ||
            data.profile?.fieldOfStudy ||
            data.profile?.grade ||
            data.grade ||
            null;

          const resolvedField = resolvedStream || resolvedMajor || 'General';

          // Location Resolution
          const resolvedLocation =
            data.locationPreference ||
            data.location ||
            data.city ||
            data.district ||
            data.address ||
            data.town ||
            data.province ||
            data.profile?.location ||
            data.profile?.city ||
            data.profile?.district ||
            data.profile?.address ||
            data.alResults?.district ||
            data.alResults?.location ||
            data.academicResults?.district ||
            data.academicResults?.location ||
            'Not specified';

          const careerGoals = parseArrayField(data.careerAspirations || data.career_goals || data.profile?.careerAspirations);
          const interests = parseArrayField(data.interests || data.hobbies || data.skills || data.profile?.interests || data.profile?.hobbies);
          const resolvedZScore = data.academicResults?.zScore || data.zScore || data.z_score || data.profile?.zScore || '0';

          return {
            id: data.id || `student-${idx}`,
            mentee_id: data.id || `student-${idx}`,
            name: resolvedName,
            email: data.email || '',
            university: data.alResults?.university || data.university || data.profile?.university || 'Unknown University',
            stream: resolvedStream,
            major: resolvedMajor,
            field_of_study: resolvedField,
            career_goals: careerGoals,
            interests: interests,
            location: resolvedLocation,
            personality_traits: data.personalityTraits || data.profile?.personalityTraits || {},
            work_environment: data.workEnvironment || data.profile?.workEnvironment || 'Not specified',
            social_interaction: data.socialInteraction || data.profile?.socialInteraction || 'Not specified',
            z_score: resolvedZScore,
            al_results: combinedSubjects,
            stress_tolerance: data.stressTolerance || data.profile?.stressTolerance || 3,
            travel_tolerance: data.travelTolerance || data.profile?.travelTolerance || 'Not specified',
            status: data.status,
            raw_data: data,
          };
        });

        console.log('✅ Final unified students list:', studentsData);

        setStudents(studentsData);
        setFilteredStudents(studentsData);
        setAllFields([...new Set(studentsData.map(s => s.field_of_study || 'General').filter(Boolean))].sort());
        setAllLocations([...new Set(studentsData.map(s => s.location || 'Not specified').filter(Boolean))].sort());
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  /* ── Filters ── */
  useEffect(() => {
    let filtered = students;
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.interests || []).some(interest =>
          interest.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (selectedField !== 'all') filtered = filtered.filter(s => s.field_of_study === selectedField);
    if (selectedLocation !== 'all') filtered = filtered.filter(s => s.location === selectedLocation);
    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [students, searchTerm, selectedField, selectedLocation]);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);
  const hasActiveFilters = searchTerm || selectedField !== 'all' || selectedLocation !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedField('all');
    setSelectedLocation('all');
    setCurrentPage(1);
  };

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
            rgba(88, 28, 135, 0.75) 50%,
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
          color: #7C3AED;
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
          color: #7C3AED;
          background: #F5F3FF;
          border: 1px solid #DDD6FE;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters-btn:hover {
          background: #EDE9FE;
          color: #6D28D9;
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
          border-color: #7C3AED;
          background: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
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
          border-color: #7C3AED;
          background-color: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
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
          color: #7C3AED;
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
          border-color: #7C3AED;
          color: #7C3AED;
          background: #F5F3FF;
        }

        .page-btn.active {
          background: #7C3AED;
          border-color: #7C3AED;
          color: #FFFFFF;
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
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
          color: #C4B5FD;
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
          background: linear-gradient(135deg, #7C3AED, #6366F1);
          color: white;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
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
            ML ENGINE ACTIVE
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
                AI-powered mentor matching analyzes student profiles, interests, and career goals
                to find the perfect mentor from our verified database.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="hero-stats-row"
              >
                <div className="hero-stat-chip">
                  <div className="chip-icon"><Users size={18} /></div>
                  <div>
                    <div className="chip-value">{students.length}</div>
                    <div className="chip-label">Students</div>
                  </div>
                </div>
                <div className="hero-stat-chip">
                  <div className="chip-icon"><GraduationCap size={18} /></div>
                  <div>
                    <div className="chip-value">{allFields.length}</div>
                    <div className="chip-label">Fields</div>
                  </div>
                </div>
                <div className="hero-stat-chip">
                  <div className="chip-icon"><MapPin size={18} /></div>
                  <div>
                    <div className="chip-value">{allLocations.length}</div>
                    <div className="chip-label">Locations</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 3D Illustration with floating badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="hero-illustration"
            >
              <img src="/mentor_hero.jpg" alt="AI Mentorship" />

              {/* Floating badges */}
              <div className="float-badge badge-1">
                <div className="float-badge-icon" style={{ background: '#7C3AED' }}>
                  <Sparkles size={14} />
                </div>
                AI Matching
              </div>
              <div className="float-badge badge-2">
                <div className="float-badge-icon" style={{ background: '#2563EB' }}>
                  <BookOpen size={14} />
                </div>
                11K+ Mentors
              </div>
              <div className="float-badge badge-3">
                <div className="float-badge-icon" style={{ background: '#059669' }}>
                  <Award size={14} />
                </div>
                Verified
              </div>
            </motion.div>
          </div>
        </div>

        {/* ══════════ BODY CONTENT ══════════ */}
        <div className="mentor-body">
          {loading ? (
            /* ── Skeleton Loading ── */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="filters-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div className="skeleton-line" style={{ width: 42, height: 42, borderRadius: 12 }} />
                  <div>
                    <div className="skeleton-line" style={{ width: 160, height: 18, marginBottom: 6 }} />
                    <div className="skeleton-line" style={{ width: 100, height: 12 }} />
                  </div>
                </div>
                <div className="skeleton-grid">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div className="skeleton-line" style={{ width: 48, height: 48, borderRadius: 14 }} />
                        <div className="skeleton-line" style={{ width: 28, height: 14, borderRadius: 6 }} />
                      </div>
                      <div className="skeleton-line" style={{ width: '40%', height: 10, marginBottom: 8 }} />
                      <div className="skeleton-line" style={{ width: '70%', height: 16, marginBottom: 16 }} />
                      <div className="skeleton-line" style={{ width: '90%', height: 10, marginBottom: 8 }} />
                      <div className="skeleton-line" style={{ width: '60%', height: 10, marginBottom: 14 }} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <div className="skeleton-line" style={{ width: 60, height: 22, borderRadius: 6 }} />
                        <div className="skeleton-line" style={{ width: 50, height: 22, borderRadius: 6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : error ? (
            /* ── Error State ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="filters-card"
            >
              <div className="empty-state">
                <div className="empty-icon-circle" style={{ background: '#FEE2E2', color: '#EF4444' }}>
                  <X size={36} strokeWidth={1.5} />
                </div>
                <div className="empty-title" style={{ color: '#DC2626' }}>{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    marginTop: 16, padding: '10px 28px', borderRadius: 12,
                    background: '#DC2626', color: 'white', border: 'none',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(220, 38, 38, 0.3)',
                  }}
                >
                  Retry
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* ── Student Database Card ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="filters-card"
              >
                {/* Header */}
                <div className="filters-header">
                  <div className="filters-title-group">
                    <div className="filters-icon-box">
                      <Users size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <div className="filters-title">Student Database</div>
                      <div className="filters-subtitle">
                        {filteredStudents.length} of {students.length} students
                      </div>
                    </div>
                  </div>
                  {hasActiveFilters && (
                    <button className="clear-filters-btn" onClick={resetFilters}>
                      <X size={14} /> Clear Filters
                    </button>
                  )}
                </div>

                {/* Filter Controls */}
                <div className="filters-row">
                  <div className="filter-input-wrap">
                    <Search size={16} className="input-icon" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, email, or interests…"
                      className="filter-input"
                    />
                  </div>
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Fields</option>
                    {allFields.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Locations</option>
                    {allLocations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Student Cards or Empty */}
                <div style={{ marginTop: 24 }}>
                  {students.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon-circle">
                        <Users size={36} strokeWidth={1.5} />
                      </div>
                      <div className="empty-title">No student assessments found</div>
                      <div className="empty-desc">Students need to complete their assessments first.</div>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon-circle">
                        <Search size={36} strokeWidth={1.5} />
                      </div>
                      <div className="empty-title">No students match your filters</div>
                      <button className="clear-filters-btn" onClick={resetFilters} style={{ margin: '12px auto 0' }}>
                        Clear all filters →
                      </button>
                    </div>
                  ) : (
                    <>
                      <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                        className="students-grid"
                      >
                        {currentStudents.map((student, i) => (
                          <StudentCard key={student.id} student={student} index={startIndex + i} />
                        ))}
                      </motion.div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="pagination-bar">
                          <div className="pagination-info">
                            Showing {startIndex + 1}–{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length}
                          </div>
                          <div className="pagination-controls">
                            <button
                              className="page-btn"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                              <ChevronLeft size={16} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => {
                              const page = i + 1;
                              const isNear = Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
                              if (!isNear && i > 0 && i < totalPages - 1) {
                                const prevIsNear = Math.abs(i - currentPage) <= 1 || i === 1 || i === totalPages;
                                if (!prevIsNear) return null;
                                return <span key={page} style={{ color: '#CBD5E1', fontSize: 13 }}>…</span>;
                              }
                              if (isNear) {
                                return (
                                  <button
                                    key={page}
                                    className={`page-btn ${page === currentPage ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                  >
                                    {page}
                                  </button>
                                );
                              }
                              return null;
                            })}
                            <button
                              className="page-btn"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>

              {/* ── ML Section Divider ── */}
              <div className="ml-section-divider">
                <div className="ml-divider-line" />
                <div className="ml-divider-badge">
                  <Sparkles size={14} />
                  ML MATCHING ENGINE
                </div>
                <div className="ml-divider-line" />
              </div>

              {/* ── ML Matching Component ── */}
              <MentorshipMatching externalStudents={students} showRawData={true} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MentorshipPage;
