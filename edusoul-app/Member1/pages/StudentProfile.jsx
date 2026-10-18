import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, BookOpen, Brain, Check, ClipboardList, GraduationCap, Mail, MapPin, Pencil, SlidersHorizontal, Target, UserRound } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useAdvisorTranslation } from '../data/advisorTranslations';
import { personalityTraits, lifestyleFactors } from '../data/dreamDegreeData';
import { createIntake, validateIntake } from '../data/advisorIntake';
import { skillLabel } from '../data/skillLabels';
import './AdvisorWorkspace.css';
import './AdvisorProfile.css';

const assessedScores = scores => Object.entries(scores || {}).filter(([, score]) => typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 10);

export default function StudentProfile({ onBack, onEditProfile, initialProfile = null }) {
  const tr = useAdvisorTranslation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [loaded, setLoaded] = useState({ key: '', profile: null, error: false });
  const [attempt, setAttempt] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');
  const requestKey = `${user?.uid || ''}:${attempt}`;
  useEffect(() => {
    let active = true;
    if (initialProfile || !user?.uid) return;
    getDoc(doc(db, 'students', user.uid)).then(snapshot => {
      if (active) setLoaded({ key: requestKey, profile: snapshot.exists() ? snapshot.data() : null, error: false });
    }).catch(() => {
      if (active) setLoaded({ key: requestKey, profile: null, error: true });
    });
    return () => { active = false; };
  }, [initialProfile, user?.uid, requestKey]);

  const raw = initialProfile || (user?.uid && loaded.key === requestKey ? loaded.profile : null);
  const loading = !initialProfile && user?.uid && loaded.key !== requestKey;
  const failed = loaded.key === requestKey && loaded.error;
  const stateCard = (Icon, title, description, retry = false) => <main className="advisor-workspace ap-page"><section className="ap-empty-state" role={retry ? 'alert' : 'status'}><span className="ap-icon"><Icon size={26} aria-hidden="true" /></span><h1>{tr(title)}</h1><p>{tr(description)}</p><div className="ap-state-actions">{onBack && <button type="button" className="am-secondary" onClick={onBack}>{tr('Back to dashboard')}</button>}{retry ? <button type="button" className="advisor-primary" onClick={() => setAttempt(value => value + 1)}>{tr('Try again')}</button> : onEditProfile && <button type="button" className="advisor-primary" onClick={onEditProfile}>{tr('Edit academic profile')}</button>}</div></section></main>;
  if (!raw && loading) return stateCard(UserRound, 'Loading your profile...', 'Preparing your academic profile.');
  if (!raw && failed) return stateCard(UserRound, 'Profile unavailable', 'Your profile could not be loaded. Please try again.', true);
  if (!raw && !user) return stateCard(UserRound, 'Login Required', 'Please log in to view your profile.');
  if (!raw) return stateCard(ClipboardList, 'No Profile Yet', 'Complete the Dream Degree form to create your student profile.');

  const data = createIntake(raw);
  const errors = validateIntake(data);
  const academic = data.academicResults;
  const info = data.personalInfo;
  const name = info.name || user?.displayName || tr('Student');
  const email = raw.email || user?.email;
  const traits = assessedScores(data.personalityScores).sort(([, a], [, b]) => b - a);
  const skills = assessedScores(data.skillScores);
  const preferences = Object.entries(data.lifestylePreferences).filter(([, value]) => value !== '' && value != null && ['string', 'number', 'boolean'].includes(typeof value));
  const subjects = Object.entries(academic.subjects);
  const essentials = [['career', 'Career goal', data.dreamJob], ['stream', 'A/L Stream', academic.stream], ['district', 'District', info.district], ['zScore', 'Z-Score', academic.zScore]];
  const completed = essentials.filter(([id]) => !errors[id]).length;
  const notAdded = value => value === '' || value == null ? tr('Not added') : tr(String(value));
  const updated = raw.updatedAt?.toDate?.() || (raw.updatedAt ? new Date(raw.updatedAt) : null);
  const updatedLabel = updated && !Number.isNaN(updated.getTime()) ? updated.toLocaleDateString(({ en: 'en-GB', si: 'si-LK', ta: 'ta-LK' })[language] || 'en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Colombo' }) : null;
  const tabs = [['overview', 'Overview', UserRound], ['academic', 'Academic', BookOpen], ['personality', 'Personality', Brain], ['skills', 'Career skills', Target], ['lifestyle', 'Lifestyle', SlidersHorizontal]];
  const scoreList = (entries, type) => entries.length ? <div className="ap-score-list">{entries.map(([key, score]) => <div className="ap-score" key={key}><div><span>{tr(type === 'personality' ? personalityTraits[key]?.label || skillLabel(key) : skillLabel(key))}</span><strong>{score}<small> / 10</small></strong></div><progress max="10" value={score} aria-label={tr(type === 'personality' ? personalityTraits[key]?.label || skillLabel(key) : skillLabel(key))} /></div>)}</div> : <p className="ap-no-data">{tr(type === 'personality' ? 'No personality data yet.' : 'No skill ratings yet.')}</p>;
  const academicCard = <section className="ap-panel"><div className="ap-panel-heading"><BookOpen size={19} aria-hidden="true" /><h2>{tr('Academic Summary')}</h2></div><dl className="ap-detail-list">{[['A/L Stream', academic.stream], ['Z-Score', academic.zScore], ['District', info.district]].map(([label, value]) => <div key={label}><dt>{tr(label)}</dt><dd data-field={label}>{notAdded(value)}</dd></div>)}</dl><h3>{tr('Subject Grades')}</h3>{subjects.length ? <div className="ap-subjects">{subjects.map(([subject, grade]) => <div key={subject}><span>{tr(subject)}</span><strong className={grade ? 'ap-grade' : 'ap-grade-empty'}>{grade || tr('Not set')}</strong></div>)}</div> : <p className="ap-no-data">{tr('No subject grades supplied.')}</p>}</section>;
  const preferencesCard = <section className="ap-panel"><div className="ap-panel-heading"><SlidersHorizontal size={19} aria-hidden="true" /><h2>{tr('Lifestyle preferences')}</h2><span className="ap-optional">{tr('Optional')}</span></div>{preferences.length ? <dl className="ap-detail-list">{preferences.map(([key, value]) => <div key={key}><dt>{tr(lifestyleFactors[key]?.label || skillLabel(key))}</dt><dd>{notAdded(value)}</dd></div>)}</dl> : <p className="ap-no-data">{tr('No lifestyle preferences set.')}</p>}</section>;

  return <main className="advisor-workspace ap-page">
    <div className="ap-page-heading"><div><p className="advisor-eyebrow">{tr('YOUR STARTING POINT')}</p><h1>{tr('My Profile')}</h1><p>{tr('Review the academic evidence and preferences behind your degree plan.')}</p></div>{onEditProfile && <button type="button" className="advisor-primary" onClick={onEditProfile}><Pencil size={16} aria-hidden="true" />{tr('Edit academic profile')}</button>}</div>
    <section className="ap-identity"><div className="ap-avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</div><div className="ap-identity-info"><h2>{name}</h2><div>{info.district && <span><MapPin size={14} aria-hidden="true" />{tr(info.district)}</span>}{info.age !== '' && info.age != null && <span>{tr('Age')}: {notAdded(info.age)}</span>}{email && <span><Mail size={14} aria-hidden="true" />{email}</span>}</div><span className="ap-student-label">{tr('Student profile')}</span></div><div className="ap-career"><span><CompassIcon />{tr('Career goal')}</span><strong>{notAdded(data.dreamJob)}</strong></div></section>
    <div className="ap-layout"><div className="ap-main"><nav className="ap-tabs" aria-label={tr('Profile sections')}>{tabs.map(([id, label, Icon]) => <button type="button" key={id} aria-current={activeSection === id ? 'page' : undefined} onClick={() => setActiveSection(id)}><Icon size={16} aria-hidden="true" /><span>{tr(label)}</span></button>)}</nav>
      <div className="ap-tab-content" data-profile-section={activeSection}>
        {activeSection === 'overview' && <><section className="ap-summary-grid">{[[GraduationCap, academic.stream, 'A/L Stream'], [BookOpen, academic.zScore, 'Z-Score'], [Brain, traits.length, 'Traits assessed'], [Target, skills.length, 'Skills assessed']].map(([Icon, value, label], index) => <article className={`ap-summary ap-summary-${index}`} key={label}><Icon size={21} aria-hidden="true" /><strong>{notAdded(value)}</strong><span>{tr(label)}</span></article>)}</section>{academicCard}<section className="ap-panel"><div className="ap-panel-heading"><Brain size={19} aria-hidden="true" /><h2>{tr('Personality self-assessment')}</h2><span className="ap-optional">{tr('Optional')}</span></div>{scoreList(traits.slice(0, 4), 'personality')}</section></>}
        {activeSection === 'academic' && academicCard}
        {activeSection === 'personality' && <section className="ap-panel"><div className="ap-panel-heading"><Brain size={19} aria-hidden="true" /><h2>{tr('Personality self-assessment')}</h2><span className="ap-optional">{tr('Optional')}</span></div><p className="ap-helper">{tr('These ratings describe your own assessment; they are not a professional evaluation.')}</p>{scoreList(traits, 'personality')}</section>}
        {activeSection === 'skills' && <section className="ap-panel"><div className="ap-panel-heading"><Target size={19} aria-hidden="true" /><h2>{tr('Career skill self-assessment')}</h2><span className="ap-optional">{tr('Optional')}</span></div><p className="ap-helper">{tr('Only the skill ratings you supplied are shown.')}</p>{scoreList(skills, 'skills')}</section>}
        {activeSection === 'lifestyle' && preferencesCard}
      </div>
    </div><aside className="ap-panel ap-readiness"><p className="advisor-eyebrow">{tr('PROFILE READINESS')}</p><h2>{tr('Your essential details')}</h2><div className="ap-readiness-total"><strong>{completed}<small> / 4</small></strong><span>{tr('Essential details ready')}</span></div><progress value={completed} max="4" aria-label={tr('Essential details ready')} /><ul>{essentials.map(([id, label, value]) => <li key={id}><span className={`ap-check ${!errors[id] ? 'is-ready' : ''}`}>{!errors[id] ? <Check size={12} aria-hidden="true" /> : null}</span><div><span>{tr(label)}</span><strong>{notAdded(value)}</strong></div></li>)}</ul><p className="ap-helper">{tr('Personality, skills and lifestyle details are optional.')}</p>{onEditProfile && <button type="button" className="am-secondary" onClick={onEditProfile}>{tr('Update my details')}<ArrowUpRight size={15} aria-hidden="true" /></button>}</aside></div>
    <footer className="ap-footer">{updatedLabel && <span>{tr('Last updated:')} {updatedLabel}</span>}{onBack && <button type="button" onClick={onBack}><ArrowLeft size={14} aria-hidden="true" />{tr('Back to dashboard')}</button>}</footer>
  </main>;
}

function CompassIcon() { return <Target size={14} aria-hidden="true" />; }
