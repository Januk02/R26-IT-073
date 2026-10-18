import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getOrCreateChat } from './chatService';

const asList = (value) => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

export const buildStudentMatchingProfile = (studentId, student = {}) => {
  const academic = student.academicResults || {};
  const personal = student.personalInfo || {};
  const degreeProgram = student.degreeProgram || student.currentDegree || student.degree || '';
  const fieldOfStudy = student.fieldOfStudy || academic.degreeProgram || academic.stream || '';
  const dreamJob = student.dreamJob || student.dream_job || student.careerGoal || '';
  const interests = [
    ...asList(student.interests),
    ...asList(student.mentorshipInterests),
    dreamJob,
    fieldOfStudy,
  ].filter(Boolean);

  return {
    studentId,
    name: personal.name || student.displayName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student',
    degreeProgram,
    fieldOfStudy,
    qualifications: asList(student.qualifications),
    dreamJob,
    interests: [...new Set(interests)],
    skills: asList(student.skills || student.skillSet),
    location: personal.district || student.location || student.district || '',
    languages: asList(student.languages),
    mentorshipNeeds: student.mentorshipNeeds || student.mentoringGoals || '',
    updatedAt: new Date().toISOString(),
  };
};

export const syncStudentMatchingProfile = async (studentId) => {
  if (!studentId) return null;
  const studentSnapshot = await getDoc(doc(db, 'students', studentId));
  if (!studentSnapshot.exists()) return null;

  const profile = buildStudentMatchingProfile(studentId, studentSnapshot.data());
  if (!profile.dreamJob && !profile.fieldOfStudy && !profile.degreeProgram && !profile.skills.length) return null;

  await setDoc(doc(db, 'studentMentorshipProfiles', studentId), profile, { merge: true });
  return profile;
};

export const getMentorMatchingProfile = async (mentorId) => {
  const snapshot = await getDoc(doc(db, 'mentorProfiles', mentorId));
  return snapshot.exists() ? snapshot.data() : null;
};

export const saveMentorMatchingProfile = async (mentorId, profile) => {
  const savedProfile = {
    ...profile,
    mentorId,
    expertise: asList(profile.expertise),
    skills: asList(profile.skills),
    qualifications: asList(profile.qualifications),
    languages: asList(profile.languages),
    updatedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'mentorProfiles', mentorId), savedProfile, { merge: true });
  return savedProfile;
};

export const rankStudentsForMentor = async (mentorProfile) => {
  const studentSnapshot = await getDocs(collection(db, 'studentMentorshipProfiles'));
  if (studentSnapshot.empty) return [];

  const response = await fetch(
    `${import.meta.env.VITE_MENTORSHIP_API_URL || 'http://localhost:5000/api'}/match-profiles`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mentor: mentorProfile,
        students: studentSnapshot.docs.map((studentDoc) => ({
          studentId: studentDoc.id,
          ...studentDoc.data(),
        })),
      }),
    },
  );

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Matching failed (${response.status})`);
  return result.matches || [];
};

export const assignMentorToStudent = async ({ mentor, student, match }) => {
  const matchId = `${student.studentId}__${mentor.mentorId}`;
  const assignment = {
    studentId: student.studentId,
    studentName: student.student_name || student.name || 'Student',
    mentorId: mentor.mentorId,
    mentorName: mentor.name,
    mentorSpecialization: mentor.specialization,
    mentorField: mentor.specialization,
    mentorHighestDegree: mentor.highestDegree,
    compatibilityScore: match.compatibility_score,
    matchProbability: match.match_probability,
    breakdown: match.breakdown || {},
    status: 'matched',
    matchedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'mentorMatches', matchId), assignment, { merge: true });
  await getOrCreateChat({
    student: { uid: student.studentId, displayName: assignment.studentName },
    mentor: {
      uid: mentor.mentorId,
      name: mentor.name,
      field: mentor.specialization,
      email: mentor.email || '',
    },
  });
  return assignment;
};

export const subscribeToStudentMatches = (studentId, onUpdate, onError) => {
  if (!studentId) return () => {};
  const matchesQuery = query(collection(db, 'mentorMatches'), where('studentId', '==', studentId));
  return onSnapshot(
    matchesQuery,
    (snapshot) => {
      const matches = snapshot.docs.map((matchDoc) => ({ id: matchDoc.id, ...matchDoc.data() }));
      matches.sort((first, second) => new Date(second.matchedAt) - new Date(first.matchedAt));
      onUpdate(matches);
    },
    onError,
  );
};

export const findAndAssignMentorsForStudent = async (studentId) => {
  try {
    // Get student profile
    const studentProfileRef = doc(db, 'studentMentorshipProfiles', studentId);
    const studentProfileSnap = await getDoc(studentProfileRef);
    
    if (!studentProfileSnap.exists()) {
      console.warn('Student profile not found for matching');
      return [];
    }

    const studentData = studentProfileSnap.data();

    // Call ML backend to find best mentors
    const response = await fetch(
      `${import.meta.env.VITE_MENTORSHIP_API_URL || 'http://localhost:5000/api'}/find-mentors`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentee_id: studentId,
          mentee_data: studentData,
          top_n: 5,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to find mentors: ${response.status}`);
    }

    const result = await response.json();
    const matches = result.matches || result.top_matches || [];

    // Save matches to Firestore
    const savedMatches = [];
    for (const match of matches) {
      const matchId = `${studentId}__${match.mentor_id}`;
      const assignment = {
        studentId: studentId,
        studentName: studentData.name || 'Student',
        mentorId: match.mentor_id,
        mentorName: match.name,
        mentorSpecialization: match.domain,
        mentorField: match.domain,
        mentorHighestDegree: match.verification_level,
        compatibilityScore: match.compatibility_score,
        matchProbability: match.compatibility_score / 100,
        breakdown: match.breakdown || {},
        status: 'matched',
        matchedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'mentorMatches', matchId), assignment, { merge: true });
      savedMatches.push({ id: matchId, ...assignment });
    }

    return savedMatches;
  } catch (error) {
    console.error('Error finding and assigning mentors:', error);
    throw error;
  }
};