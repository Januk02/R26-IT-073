import StreamSubjectFields from '../components/StreamSubjectFields';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ClipboardList, SlidersHorizontal, Target } from 'lucide-react';
import AdvisorHeader from '../components/AdvisorHeader';
import CareerSkillAssessment from '../components/CareerSkillAssessment';
import { useAdvisorTranslation } from '../data/advisorTranslations';
import { dreamJobs, personalityTraits, lifestyleFactors } from '../data/dreamDegreeData';
import { STREAM_SUBJECTS, ALL_DISTRICTS } from '../data/advisorIntakeData';
import { createIntake, validateIntake, updateIntakeSubject, prepareStreamSubjects } from '../data/advisorIntake';
import './AdvisorWorkspace.css';

export default function DreamDegreeInput({ onAnalyze, onBack, onViewProfile, onNavigateToDashboard, initialData }) {
  const tr = useAdvisorTranslation();
  const [draft, setData] = useState(() => createIntake(initialData || {}));
  // Keep visible fields and submitted evidence aligned, including after hot reload.
  const data = createIntake(draft);
  const [errors, setErrors] = useState(() => {
    const subjects = validateIntake(createIntake(initialData || {})).subjects;
    return subjects ? { subjects } : {};
  });
  const [subjectCleanup, setSubjectCleanup] = useState(() => prepareStreamSubjects(initialData?.academicResults?.stream, initialData?.academicResults?.subjects));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [openPanels, setOpenPanels] = useState(() => ({ academic: prepareStreamSubjects(initialData?.academicResults?.stream, initialData?.academicResults?.subjects).adjusted || !!validateIntake(createIntake(initialData || {})).subjects }));
  const update = (group, key, value) => {
    setData(current => ({ ...current, [group]: { ...current[group], [key]: value } }));
    setErrors(current => ({ ...current, [key]: undefined }));
  };
  const selectCareer = career => {
    setData(current => ({ ...current, dreamJob: career, skillScores: current.dreamJob === career ? current.skillScores : {} }));
    setErrors(current => ({ ...current, career: undefined }));
    setPickerOpen(false);
    setSearch('');
  };
  const selectedJob = dreamJobs.find(job => job.title === data.dreamJob);
  const filteredJobs = dreamJobs.filter(job => (category === 'All' || job.category === category) && `${job.title} ${tr(job.title)} ${job.category} ${tr(job.category)} ${(job.aliases || []).join(' ')}`.toLowerCase().includes(search.toLowerCase()));
  const valid = validateIntake(data);
  const essentials = [['career', 'Career goal', selectedJob?.title], ['stream', 'A/L Stream', data.academicResults.stream], ['district', 'District', data.personalInfo.district], ['zScore', 'Z-Score', data.academicResults.zScore]];
  const completed = essentials.filter(([id]) => !valid[id]).length;
  const subjects = Object.entries(data.academicResults.subjects || {});
  const streamRule = STREAM_SUBJECTS[data.academicResults.stream];
  const setSubject = (index, name, grade) => {
    update('academicResults', 'subjects', updateIntakeSubject(data.academicResults.subjects, index, name, grade));
  };
  const errorText = key => errors[key] && <span className="advisor-field-error" id={`${key}-error`}>{tr(errors[key])}</span>;
  const fieldProps = key => ({ id: key, 'aria-invalid': !!errors[key], 'aria-describedby': errors[key] ? `${key}-error` : undefined });
  const panel = (id, title, description, count, content) => <details className="advisor-disclosure" open={!!openPanels[id]} onToggle={event => {
    const open = event.currentTarget.open;
    setOpenPanels(current => current[id] === open ? current : { ...current, [id]: open });
  }}>
    <summary><span className="advisor-disclosure-icon"><SlidersHorizontal size={18} aria-hidden="true" /></span><span><strong>{tr(title)}</strong><small>{tr(description)}</small></span><span className="advisor-optional">{count > 0 ? `${count} ${tr('added')}` : tr('Optional')}</span><ChevronDown size={17} className="advisor-chevron" aria-hidden="true" /></summary>
    <div className="advisor-disclosure-body">{content}</div>
  </details>;
  const submit = event => {
    event.preventDefault();
    const next = validateIntake(data);
    setErrors(next);
    if (Object.keys(next).length) {
      setOpenPanels(current => ({ ...current, academic: !!(next.subjects || next.commonGeneralTest || next.potentialZScore) || current.academic, personal: !!next.age || current.personal }));
      requestAnimationFrame(() => document.getElementById(Object.keys(next)[0])?.focus());
      return;
    }
    onAnalyze(data);
  };

  return <div className="advisor-workspace">
    <AdvisorHeader onHome={onBack} onViewProfile={onViewProfile} onNavigateToDashboard={onNavigateToDashboard} />
    <main className="advisor-container">
      <div className="advisor-breadcrumb"><button type="button" onClick={onBack}><ArrowLeft size={15} aria-hidden="true" />{tr('Overview')}</button><span>/</span><span>{tr('Your profile')}</span></div>
      <div className="advisor-page-heading"><div><p className="advisor-eyebrow">{tr('FUTURE DREAM DEGREE ADVISOR')}</p><h1>{tr('A clear direction starts here.')}</h1><p>{tr('Start with four essentials. Add more detail only where it matters to you.')}</p></div><span className="advisor-step-label"><ClipboardList size={17} aria-hidden="true" />{tr('One profile. Your possibilities.')}</span></div>
      <form className="advisor-intake-layout" onSubmit={submit} noValidate>
        <div className="advisor-intake-main">
          <section className="advisor-panel" aria-labelledby="goal-heading">
            <div className="advisor-section-heading"><span className="advisor-section-number">01</span><div><h2 id="goal-heading">{tr('Where do you want to go?')}</h2><p>{tr('Choose the career we should work backwards from.')}</p></div><Target size={20} className="advisor-muted-icon" aria-hidden="true" /></div>
            <label className="advisor-label" htmlFor="career">{tr('Career goal')} <span>*</span></label>
            <button {...fieldProps('career')} type="button" className="advisor-career-trigger" aria-expanded={pickerOpen} aria-controls="career-picker" onClick={() => setPickerOpen(current => !current)}><span>{selectedJob ? <><strong>{tr(selectedJob.title)}</strong><small>{tr(selectedJob.category)}</small></> : tr('Select your career goal')}</span><ChevronDown size={18} aria-hidden="true" /></button>
            {errorText('career')}
            {pickerOpen && <div id="career-picker" className="advisor-career-picker">
              <div className="advisor-picker-filters"><label><span className="advisor-sr-only">{tr('Search careers')}</span><input autoFocus type="search" value={search} placeholder={tr('Search careers')} onChange={event => setSearch(event.target.value)} /></label><label><span className="advisor-sr-only">{tr('Category')}</span><select value={category} onChange={event => setCategory(event.target.value)}>{['All', ...new Set(dreamJobs.map(job => job.category))].map(value => <option key={value} value={value}>{tr(value)}</option>)}</select></label></div>
              <div className="advisor-career-options">{filteredJobs.map(job => <button type="button" key={job.id} aria-pressed={data.dreamJob === job.title} onClick={() => selectCareer(job.title)}><span>{tr(job.title)}<small>{tr(job.category)}</small></span>{data.dreamJob === job.title && <Check size={16} aria-hidden="true" />}</button>)}{!filteredJobs.length && <p>{tr('No matching careers. Try another search.')}</p>}</div>
            </div>}
            {selectedJob && <p className="advisor-career-description">{tr(selectedJob.description)}</p>}
          </section>
          <section className="advisor-panel" aria-labelledby="academic-heading">
            <div className="advisor-section-heading"><span className="advisor-section-number">02</span><div><h2 id="academic-heading">{tr('Your academic starting point')}</h2><p>{tr('Use the district and results from your A/L examination.')}</p></div></div>
            <div className="advisor-field-grid">
              <label className="advisor-field"><span>{tr('A/L Stream')} *</span><select {...fieldProps('stream')} value={data.academicResults.stream} onChange={event => {
                setData(current => ({ ...current, academicResults: { ...current.academicResults, stream: event.target.value, subjects: Object.fromEntries((STREAM_SUBJECTS[event.target.value]?.required || []).map(subject => [subject, ''])) } }));
                setSubjectCleanup({ adjusted: false, requiresReselection: false });
                setErrors(current => ({ ...current, stream: undefined, subjects: undefined }));
              }}><option value="">{tr('Select your A/L stream.')}</option>{Object.keys(STREAM_SUBJECTS).map(stream => <option key={stream} value={stream}>{tr(stream)}</option>)}</select>{errorText('stream')}</label>
              <label className="advisor-field"><span>{tr('District')} *</span><select {...fieldProps('district')} value={data.personalInfo.district} onChange={event => update('personalInfo', 'district', event.target.value)}><option value="">{tr('Select district')}</option>{ALL_DISTRICTS.map(district => <option key={district} value={district}>{tr(district)}</option>)}</select>{errorText('district')}</label>
              <label className="advisor-field advisor-z-field"><span>{tr('Z-Score')} *</span><input {...fieldProps('zScore')} type="number" step="any" min="-4" max="4" value={data.academicResults.zScore} placeholder="0.0000" onChange={event => update('academicResults', 'zScore', event.target.value)} />{errorText('zScore')}<small>{tr('Enter your official Z-score. Course and district cutoffs must be checked separately.')}</small></label>
            </div>
          </section>
          <div className="advisor-mobile-action"><button className="advisor-primary advisor-submit" type="submit">{tr('Build my degree plan')}<ArrowRight size={17} aria-hidden="true" /></button><p className="advisor-error-summary" role="status">{Object.values(errors).some(Boolean) ? tr('Review the highlighted fields to continue.') : completed === 4 ? tr('All essentials complete. You can continue now.') : tr('Complete the four essential details to begin.')}</p></div>
          <div className="advisor-refine-heading"><div><h2>{tr('Make it more personal')}</h2><p>{tr('Optional details help refine your recommendations. You can leave these unanswered.')}</p></div><span>{tr('Optional')}</span></div>
          {panel('academic', 'Academic evidence', 'Subject grades, general test and a target Z-score', subjects.filter(([, grade]) => grade).length + Number(data.academicResults.commonGeneralTest !== '' && data.academicResults.commonGeneralTest != null), <>
            <p className="advisor-help">{tr('Add up to three subject grades. These help check entry requirements.')}</p>
            {streamRule?.required.length > 0 && <p className="advisor-help">{tr('Main subject names are fixed for this stream. Enter their grades and choose the third subject. Grades remain optional.')}</p>}
            {streamRule && <div className="advisor-subject-guidance"><strong>{tr(data.academicResults.stream)}</strong><p>{tr(streamRule.description)}</p></div>}
            {subjectCleanup.adjusted && <p className="advisor-help" role="status">{tr(subjectCleanup.requiresReselection ? 'Your saved profile contained more than three subjects for this stream. Select your actual three subjects and grades again.' : 'Saved subjects outside the selected stream were removed from this form. Check your remaining subjects and grades.')}</p>}
            <div id="subjects" tabIndex={-1} aria-describedby={errors.subjects ? 'subjects-error' : undefined}>{errorText('subjects')}</div>
            {!data.academicResults.stream ? <p className="advisor-help">{tr('Select your A/L stream first.')}</p> : <StreamSubjectFields stream={data.academicResults.stream} subjects={data.academicResults.subjects} onChange={setSubject} />}
            <div className="advisor-field-grid"><label className="advisor-field"><span>{tr('Common General Test mark (optional)')}</span><input {...fieldProps('commonGeneralTest')} type="number" min="0" max="100" value={data.academicResults.commonGeneralTest ?? ''} onChange={event => update('academicResults', 'commonGeneralTest', event.target.value)} />{errorText('commonGeneralTest')}</label><label className="advisor-field"><span>{tr('Target Z-score')}</span><input {...fieldProps('potentialZScore')} type="number" step="any" min="-4" max="4" value={data.academicResults.predictedPerformance?.potentialZScore ?? ''} onChange={event => {
              update('academicResults', 'predictedPerformance', { ...data.academicResults.predictedPerformance, potentialZScore: event.target.value });
              setErrors(current => ({ ...current, potentialZScore: undefined }));
            }} />{errorText('potentialZScore')}</label></div>
          </>)}
          {panel('strengths', 'Strengths & skills', 'A compact self-assessment, at your own pace', Object.keys(data.personalityScores).length + Object.keys(data.skillScores).length, <>
            <p className="advisor-help">{tr('Rate yourself on each trait from 0 (lowest) to 10 (highest)')}</p>
            <div className="advisor-rating-grid">{Object.entries(personalityTraits).map(([key, trait]) => <label className="advisor-rating-row" key={key}><span><strong>{tr(trait.label)}</strong><small>{tr(trait.description)}</small></span><select aria-label={tr(trait.label)} value={data.personalityScores[key] ?? ''} onChange={event => {
              const scores = { ...data.personalityScores };
              if (event.target.value === '') delete scores[key]; else scores[key] = Number(event.target.value);
              setData(current => ({ ...current, personalityScores: scores }));
            }}><option value="">{tr('Not assessed')}</option>{Array.from({ length: 11 }, (_, score) => <option key={score} value={score}>{score} / 10</option>)}</select></label>)}</div>
            {selectedJob ? <CareerSkillAssessment career={data.dreamJob} scores={data.skillScores} onChange={scores => setData(current => ({ ...current, skillScores: scores }))} /> : <p className="advisor-help">{tr('Choose a career to assess relevant skills.')}</p>}
          </>)}
          {panel('preferences', 'Work preferences', 'Location, lifestyle and what matters to you', Object.keys(data.lifestylePreferences).length, <div className="advisor-field-grid">{Object.entries(lifestyleFactors).map(([key, factor]) => <label className="advisor-field" key={key}><span>{tr(factor.label)}</span><select value={data.lifestylePreferences[key] ?? ''} onChange={event => {
            const preferences = { ...data.lifestylePreferences };
            if (event.target.value === '') delete preferences[key]; else preferences[key] = event.target.value;
            setData(current => ({ ...current, lifestylePreferences: preferences }));
          }}><option value="">{tr('Not assessed')}</option>{factor.options.map(option => <option key={option.value} value={option.value}>{tr(option.label)}</option>)}</select></label>)}</div>)}
          {panel('personal', 'Personal details', 'A name for your profile and your age', Number(!!data.personalInfo.name) + Number(data.personalInfo.age !== ''), <div className="advisor-field-grid"><label className="advisor-field"><span>{tr('Full Name')}</span><input autoComplete="name" value={data.personalInfo.name} onChange={event => update('personalInfo', 'name', event.target.value)} /></label><label className="advisor-field"><span>{tr('Age')}</span><input {...fieldProps('age')} type="number" min="0" max="120" value={data.personalInfo.age} onChange={event => update('personalInfo', 'age', event.target.value)} />{errorText('age')}</label></div>)}
        </div>
        <aside className="advisor-summary" aria-label={tr('Profile summary')}>
          <div className="advisor-summary-top"><p className="advisor-eyebrow">{tr('YOUR STARTING POINT')}</p><h2>{tr('Ready when you are.')}</h2><p>{tr('Your goal and academic details are enough to begin.')}</p></div>
          <div className="advisor-progress-label"><span>{tr('Essential details')}</span><strong>{completed} / 4</strong></div><progress max="4" value={completed} aria-label={tr('Essential details')} />
          <dl className="advisor-summary-list">{essentials.map(([id, label, value]) => <div key={id}><dt><span className={`advisor-status-dot ${!valid[id] ? 'is-complete' : ''}`}>{!valid[id] && <Check size={10} aria-hidden="true" />}</span>{tr(label)}</dt><dd>{!valid[id] ? tr(String(value)) : tr('Not added')}</dd></div>)}</dl>
          <button className="advisor-primary advisor-submit" type="submit">{tr('Build my degree plan')}<ArrowRight size={17} aria-hidden="true" /></button>
          <p className="advisor-error-summary" role="status">{Object.values(errors).some(Boolean) ? tr('Review the highlighted fields to continue.') : completed === 4 ? tr('All essentials complete. You can continue now.') : tr('Complete the four essential details to begin.')}</p>
          <div className="advisor-summary-output"><h3>{tr('What you will receive')}</h3><ul>{['Degree & university options', 'Career requirements & skill gaps', 'A practical next-step roadmap'].map(text => <li key={text}><Check size={14} aria-hidden="true" />{tr(text)}</li>)}</ul></div>
        </aside>
      </form>
    </main>
  </div>;
}
