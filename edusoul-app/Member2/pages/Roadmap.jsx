import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, ArrowRight, Circle, RotateCcw,
  Compass, Check
} from 'lucide-react';
import { useCareerData } from '../context/CareerContext';
import './Roadmap.css';

export default function Roadmap() {
  const {
    recentPathways, selectedPathway, setSelectedPathway,
    updatePathwayProgress
  } = useCareerData();

  const [activePathwayId, setActivePathwayId] = useState(null);
  const [filterTab, setFilterTab] = useState('all');

  const hasData = recentPathways.length > 0;

  const currentPathway = activePathwayId
    ? recentPathways.find(p => p.id === activePathwayId)
    : (selectedPathway || recentPathways[0]);

  const handleMarkComplete = (skillObj) => {
    if (!currentPathway) return;

    const newMissing = (currentPathway.missing_requirements || []).filter(
      (req) => req.req !== skillObj.req
    );
    const newMastered = [...(currentPathway.current_skills || []), skillObj.req];
    const impact = Math.round((skillObj.weight || 5) * 1.5);
    const newReadiness = Math.min(100, (currentPathway.market_readiness || 0) + impact);
    const currentSgi = currentPathway.matchScore || currentPathway.sgi_score || 0;
    const newSgi = Math.max(0, currentSgi - impact);

    updatePathwayProgress(currentPathway.id, {
      missing_requirements: newMissing,
      current_skills: newMastered,
      market_readiness: newReadiness,
      matchScore: newSgi,
      sgi_score: newSgi,
      initial_skills_count: newMastered.length,
    });
  };

  const handleUnmarkComplete = (skillName) => {
    if (!currentPathway) return;

    const newMastered = (currentPathway.current_skills || []).filter(
      (s) => s !== skillName
    );
    const reAddedSkill = {
      req: skillName,
      weight: 5.0,
      type: skillName.toLowerCase().includes('degree') || skillName.toLowerCase().includes('bachelor') || skillName.toLowerCase().includes('master') ? 'Degree' : 'Skill'
    };
    const newMissing = [reAddedSkill, ...(currentPathway.missing_requirements || [])];
    const impact = 7.5;
    const newReadiness = Math.max(0, (currentPathway.market_readiness || 0) - impact);
    const currentSgi = currentPathway.matchScore || currentPathway.sgi_score || 0;
    const newSgi = Math.min(100, currentSgi + impact);

    updatePathwayProgress(currentPathway.id, {
      missing_requirements: newMissing,
      current_skills: newMastered,
      market_readiness: newReadiness,
      matchScore: newSgi,
      sgi_score: newSgi,
      initial_skills_count: newMastered.length,
    });
  };

  if (!hasData) {
    return (
      <div className="roadmap-human-empty">
        <div className="empty-content-box">
          <div className="empty-icon-circle">
            <Compass size={36} />
          </div>
          <h2>No Career Roadmap Created Yet</h2>
          <p>
            Scan your profile in the Career Analyzer to discover your target role and generate your personalized step-by-step learning roadmap.
          </p>
          <a href="/analyzer" className="primary-human-btn">
            Create My Career Roadmap <ArrowRight size={16} />
          </a>
        </div>
      </div>
    );
  }

  const missingReqs = currentPathway?.missing_requirements || [];
  const masteredSkills = currentPathway?.current_skills || [];
  const readiness = Math.round(currentPathway?.market_readiness || 0);
  const totalSkillsCount = missingReqs.length + masteredSkills.length;

  return (
    <div className="roadmap-human-container">
      {/* ── PATHWAY SELECTOR HEADER ── */}
      <div className="pathway-switcher-bar">
        <span className="switcher-label">Select Target Role:</span>
        <div className="role-pill-group">
          {recentPathways.map((pathway) => {
            const isActive = currentPathway?.id === pathway.id;
            const pReadiness = Math.round(pathway.market_readiness || 0);
            return (
              <button
                key={pathway.id}
                className={`role-pill ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActivePathwayId(pathway.id);
                  setSelectedPathway(pathway);
                }}
              >
                <span className="role-title-text">{pathway.role}</span>
                <span className="role-score-tag">{pReadiness}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN ROADMAP HEADER ── */}
      {currentPathway && (
        <div className="roadmap-hero-card">
          <div className="hero-main-details">
            <div className="role-header-line">
              <span className="role-kicker">LEARNING ROADMAP</span>
              <h1 className="role-main-title">{currentPathway.role}</h1>
              {currentPathway.recommended_degree && (
                <div className="academic-benchmark-tag">
                  <GraduationCap size={15} />
                  <span>Benchmark: {currentPathway.recommended_degree}</span>
                </div>
              )}
            </div>

            <div className="readiness-score-box">
              <div className="big-score">{readiness}%</div>
              <div className="score-desc">
                <span>Job Readiness</span>
                <span className="sub-count">{masteredSkills.length} of {totalSkillsCount} completed</span>
              </div>
            </div>
          </div>

          {/* Hyper-Modern Liquid Progress Visualizer */}
          <div className="readiness-progress-wrapper">
            <div className="progress-bar-track">
              <div className="track-tick tick-25" />
              <div className="track-tick tick-50" />
              <div className="track-tick tick-75" />

              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(readiness, 100)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {readiness > 0 && <div className="leading-edge-node" />}
              </motion.div>
            </div>
            <div className="progress-labels">
              <span>0% Start</span>
              <span>{missingReqs.length > 0 ? `${missingReqs.length} skills remaining` : 'Target Achieved! 🎉'}</span>
              <span>100% Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* ── ROADMAP STEPS & FILTER TABS ── */}
      <div className="roadmap-steps-section">
        <div className="steps-filter-bar">
          <div className="filter-tabs">
            <button
              className={`tab-btn ${filterTab === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTab('all')}
            >
              All Steps ({totalSkillsCount})
            </button>
            <button
              className={`tab-btn ${filterTab === 'remaining' ? 'active' : ''}`}
              onClick={() => setFilterTab('remaining')}
            >
              To Learn ({missingReqs.length})
            </button>
            <button
              className={`tab-btn ${filterTab === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterTab('completed')}
            >
              Completed ({masteredSkills.length})
            </button>
          </div>
        </div>

        {/* ── STEP-BY-STEP VERTICAL TIMELINE ── */}
        <div className="timeline-flow">
          {(filterTab === 'all' || filterTab === 'remaining') && (
            <>
              {missingReqs.length > 0 && (
                <div className="flow-section-title">
                  <span>Up Next in Your Pathway</span>
                </div>
              )}

              {missingReqs.map((skillItem, index) => {
                const isFirst = index === 0;
                const isDegree = skillItem.type === 'Degree';
                const readinessBoost = Math.round((skillItem.weight || 5) * 1.5);
                const stepNumber = index + 1;

                return (
                  <motion.div
                    key={`missing-${skillItem.req}-${index}`}
                    className={`step-card ${isFirst ? 'current-focus' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <div className="step-marker-column">
                      <div className={`step-circle ${isFirst ? 'active' : isDegree ? 'academic' : ''}`}>
                        {isDegree ? <GraduationCap size={15} /> : stepNumber}
                      </div>
                      <div className="step-connector-line" />
                    </div>

                    <div className="step-content-box">
                      <div className="step-card-header">
                        <div className="step-title-wrap">
                          <h3 className="step-name">{skillItem.req}</h3>
                          <div className="step-tags">
                            {isFirst && <span className="tag focus">Recommended Next</span>}
                            {isDegree ? (
                              <span className="tag academic">Degree Benchmark</span>
                            ) : (
                              <span className="tag skill">Skill</span>
                            )}
                          </div>
                        </div>

                        <button
                          className="complete-toggle-btn"
                          onClick={() => handleMarkComplete(skillItem)}
                          title="Click to mark this skill as mastered"
                        >
                          <Circle size={18} />
                          <span>Mark Complete</span>
                        </button>
                      </div>

                      <p className="step-description">
                        {isDegree
                          ? 'Academic degree qualification associated with higher hiring preference for this role.'
                          : `High-value technical competency required for ${currentPathway?.role || 'this role'}.`}
                      </p>

                      <div className="step-footer-bar">
                        <span className="readiness-boost-tag">
                          +{readinessBoost}% Readiness Boost
                        </span>
                        {skillItem.weight && (
                          <span className="market-weight-text">
                            Market Priority: {Number(skillItem.weight).toFixed(1)} / 10
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}

          {(filterTab === 'all' || filterTab === 'completed') && (
            <>
              {masteredSkills.length > 0 && (
                <div className="flow-section-title completed-title">
                  <span>Mastered Skills ({masteredSkills.length})</span>
                </div>
              )}

              {masteredSkills.map((skillName, index) => (
                <motion.div
                  key={`mastered-${skillName}-${index}`}
                  className="step-card completed-step"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="step-marker-column">
                    <div className="step-circle completed">
                      <Check size={16} />
                    </div>
                    {index < masteredSkills.length - 1 && <div className="step-connector-line" />}
                  </div>

                  <div className="step-content-box">
                    <div className="step-card-header">
                      <div className="step-title-wrap">
                        <h3 className="step-name completed">{skillName}</h3>
                        <span className="tag completed-tag">Verified on Profile</span>
                      </div>

                      <button
                        className="undo-toggle-btn"
                        onClick={() => handleUnmarkComplete(skillName)}
                        title="Click to move back to your learning list"
                      >
                        <RotateCcw size={14} />
                        <span>Move to Learning</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
