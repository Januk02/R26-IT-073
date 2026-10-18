import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../src/contexts/AuthContext';
import { db } from '../../src/firebase';
import {
  assignMentorToStudent,
  getMentorMatchingProfile,
  rankStudentsForMentor,
  saveMentorMatchingProfile,
} from '../../src/services/mentorMatchingService';
import { Award, BookOpen, BriefcaseBusiness, MapPin, MessageSquare, Pencil, Sparkles, Users } from 'lucide-react';

const EMPTY_PROFILE = {
  name: '',
  highestDegree: '',
  qualifications: '',
  specialization: '',
  industryRole: '',
  yearsExperience: '',
  expertise: '',
  skills: '',
  location: '',
  languages: '',
  availabilityHours: '4',
};

const fetchMentorMatches = async (mentorProfile, mentorId) => {
  const [ranked, assigned] = await Promise.all([
    rankStudentsForMentor(mentorProfile),
    getDocs(query(collection(db, 'mentorMatches'), where('mentorId', '==', mentorId))),
  ]);
  return {
    matches: ranked,
    matchedStudentIds: assigned.docs.map((matchDoc) => matchDoc.data().studentId),
  };
};

const MentorMatchCenter = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [matches, setMatches] = useState([]);
  const [matchedStudentIds, setMatchedStudentIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matching, setMatching] = useState(false);
  const [assigningId, setAssigningId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user?.uid) return;
      try {
        const savedProfile = await getMentorMatchingProfile(user.uid);
        if (!active) return;
        if (savedProfile) {
          setProfile(savedProfile);
          setForm({ ...EMPTY_PROFILE, ...savedProfile,
            qualifications: (savedProfile.qualifications || []).join(', '),
            expertise: (savedProfile.expertise || []).join(', '),
            skills: (savedProfile.skills || []).join(', '),
            languages: (savedProfile.languages || []).join(', '),
          });
          setMatching(true);
          const result = await fetchMentorMatches(savedProfile, user.uid);
          if (active) {
            setMatches(result.matches);
            setMatchedStudentIds(result.matchedStudentIds);
            setMatching(false);
          }
        } else {
          setForm({ ...EMPTY_PROFILE, name: user.displayName || user.email?.split('@')[0] || '' });
          setShowForm(true);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Could not load your mentor profile.');
          setMatching(false);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [user]);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSave = async (event) => {
    event.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    setError('');
    try {
      const savedProfile = await saveMentorMatchingProfile(user.uid, {
        ...form,
        name: form.name.trim(),
        yearsExperience: Number(form.yearsExperience),
        availabilityHours: Number(form.availabilityHours),
      });
      setProfile(savedProfile);
      setShowForm(false);
      setMatching(true);
      const result = await fetchMentorMatches(savedProfile, user.uid);
      setMatches(result.matches);
      setMatchedStudentIds(result.matchedStudentIds);
    } catch (saveError) {
      setError(saveError.message || 'Could not save your profile.');
    } finally {
      setMatching(false);
      setSaving(false);
    }
  };

  const handleAssign = async (match) => {
    setAssigningId(match.student_id);
    setError('');
    try {
      const assignment = await assignMentorToStudent({
        mentor: profile,
        student: { studentId: match.student_id, student_name: match.student_name },
        match,
      });
      setMatchedStudentIds((current) => [...new Set([...current, assignment.studentId])]);
      onOpenChat?.();
    } catch (assignError) {
      setError(assignError.message || 'Could not assign this student.');
    } finally {
      setAssigningId('');
    }
  };

  return (
    <section id="mentor-match-center" className="mx-auto my-8 max-w-[1440px] px-5 md:px-10">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-blue-700"><Sparkles size={15} /> Mentor matching</p>
            <h2 className="text-xl font-extrabold text-slate-900">Student recommendations</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">AI ranks student profiles against your qualifications, expertise, skills and availability.</p>
          </div>
          {profile && <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={15} /> Edit profile</button>}
        </div>

        {loading || matching ? (
          <p className="mt-6 text-sm text-slate-500">{loading ? 'Loading your matching profile…' : 'Comparing available student profiles…'}</p>
        ) : matches.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">No student profiles are ready to match yet. Students appear here after completing their academic and career profile.</div>
        ) : (
          <div className="mt-6 divide-y divide-slate-100">
            {matches.slice(0, 10).map((match, index) => {
              const studentId = match.student_id;
              const interests = match.student_interests || [];
              return (
                <article key={studentId} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-sm font-extrabold text-blue-800">{index + 1}</span>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900">{match.student_name || 'Student'}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                        {match.degree_program && <span className="inline-flex items-center gap-1"><BookOpen size={12} />{match.degree_program}</span>}
                        {match.field_of_study && <span>{match.field_of_study}</span>}
                        {match.location && <span className="inline-flex items-center gap-1"><MapPin size={12} />{match.location}</span>}
                      </div>
                      {interests.length > 0 && <p className="mt-1 truncate text-xs text-slate-500">Career interests: {interests.join(', ')}</p>}
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Award size={12} /> Model confidence {Math.round(match.match_probability || 0)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold text-blue-700">{Math.round(match.compatibility_score || 0)}%</span>
                    {matchedStudentIds.includes(studentId) ? (
                      <button type="button" onClick={() => onOpenChat?.()} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"><MessageSquare size={15} /> Open chat</button>
                    ) : (
                      <button type="button" disabled={!!assigningId} onClick={() => handleAssign(match)} className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"><Users size={15} /> {assigningId === studentId ? 'Connecting…' : 'Match student'}</button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="mentor-profile-title" className="my-auto w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl md:p-7">
            <div className="mb-5">
              <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-blue-700"><BriefcaseBusiness size={15} /> Matching profile</p>
              <h2 id="mentor-profile-title" className="text-2xl font-extrabold text-slate-900">Help us find your students</h2>
              <p className="mt-1 text-sm text-slate-600">Your degree, credentials and expertise are used to rank students whose goals fit your experience.</p>
            </div>
            <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Display name<input name="name" required value={form.name} onChange={updateField} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Highest degree<input name="highestDegree" required value={form.highestDegree} onChange={updateField} placeholder="e.g. BSc in Computer Science" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Professional qualifications<input name="qualifications" value={form.qualifications} onChange={updateField} placeholder="e.g. AWS, CIMA, PMP" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Specialization<input name="specialization" required value={form.specialization} onChange={updateField} placeholder="e.g. Software Engineering" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Current role<input name="industryRole" required value={form.industryRole} onChange={updateField} placeholder="e.g. Senior Software Engineer" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Years of experience<input name="yearsExperience" type="number" min="0" required value={form.yearsExperience} onChange={updateField} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Expertise and skills<input name="expertise" required value={form.expertise} onChange={updateField} placeholder="Comma-separated areas, e.g. Python, cloud, career planning" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Location<input name="location" value={form.location} onChange={updateField} placeholder="City or district" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Languages<input name="languages" value={form.languages} onChange={updateField} placeholder="English, Sinhala" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
              <label className="text-sm font-semibold text-slate-700">Available hours per week<input name="availabilityHours" type="number" min="1" max="80" required value={form.availabilityHours} onChange={updateField} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>
              <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
                {profile && <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>}
                <button type="submit" disabled={saving} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{saving ? 'Saving profile…' : 'Save and find students'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default MentorMatchCenter;