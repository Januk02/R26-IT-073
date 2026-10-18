import { useAdvisorTranslation } from '../data/advisorTranslations';
import { STREAM_SUBJECTS } from '../data/advisorIntakeData';
import { intakeSubjectOptions } from '../data/advisorIntake';

export default function StreamSubjectFields({ stream, subjects, onChange }) {
  const tr = useAdvisorTranslation();
  const entries = Object.entries(subjects || {});
  const required = STREAM_SUBJECTS[stream]?.required || [];
  return <div className="advisor-subject-rows">
    {Array.from({ length: 3 }, (_, index) => {
      const [name = '', grade = ''] = entries[index] || [];
      const fixed = !!required[index];
      const label = fixed ? tr('Main subject') : required.length ? tr('Third subject') : `${tr('Subject')} ${index + 1}`;
      return <div className="advisor-subject-row" key={`${stream}-${index}`}>
        <label><span className="advisor-subject-label">{label}</span>
          {fixed ? <input type="text" value={tr(required[index])} aria-label={label} readOnly className="advisor-fixed-subject" /> :
            <select aria-label={label} value={name} onChange={event => onChange(index, event.target.value, '')}>
              <option value="">{tr('Select subject')}</option>
              {intakeSubjectOptions(stream, subjects, index).map(group => <optgroup key={group.label} label={tr(group.label)}>
                {group.subjects.map(subject => <option key={subject} value={subject}>{tr(subject)}</option>)}
              </optgroup>)}
            </select>}
        </label>
        <label><span className="advisor-subject-label">{tr('Grade')}</span><select aria-label={`${tr('Grade')} ${index + 1}`} disabled={!name} value={grade} onChange={event => onChange(index, name, event.target.value)}>
          <option value="">{tr('Grade')}</option>
          {['A', 'B', 'C', 'S', 'F'].map(value => <option key={value}>{value}</option>)}
        </select></label>
        {name && !fixed && <button type="button" className="advisor-remove-subject" onClick={() => onChange(index, '', '')} aria-label={`${tr('Remove subject')}: ${tr(name)}`}>{tr('Remove')}</button>}
      </div>;
    })}
  </div>;
}
