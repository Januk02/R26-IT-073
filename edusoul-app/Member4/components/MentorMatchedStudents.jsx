import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  Languages,
  MapPin,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../../src/contexts/AuthContext";
import { db } from "../../src/firebase";

const asList = (value) => {
  if (Array.isArray(value))
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
  if (typeof value === "string")
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  if (value && typeof value === "object")
    return Object.values(value).map(String).filter(Boolean);
  return [];
};

const displayValue = (value) => {
  if (value === null || value === undefined || value === "")
    return "Not provided";
  if (Array.isArray(value)) return value.join(", ") || "Not provided";
  if (typeof value === "object")
    return Object.values(value).join(", ") || "Not provided";
  return String(value);
};

const MentorMatchedStudents = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let active = true;

    const loadMatches = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const [matchesSnapshot, chatsSnapshot] = await Promise.all([
          getDocs(
            query(
              collection(db, "mentorMatches"),
              where("mentorId", "==", user.uid),
            ),
          ),
          getDocs(
            query(
              collection(db, "chats"),
              where("participants", "array-contains", user.uid),
            ),
          ),
        ]);

        const matchesByStudent = new Map();
        matchesSnapshot.docs
          .map((matchDoc) => ({ id: matchDoc.id, ...matchDoc.data() }))
          .filter((match) => match.studentId && match.mentorId === user.uid)
          .forEach((match) => matchesByStudent.set(match.studentId, match));

        chatsSnapshot.docs
          .map((chatDoc) => ({ id: chatDoc.id, ...chatDoc.data() }))
          .filter(
            (chat) =>
              chat.mentorId === user.uid &&
              chat.studentId &&
              chat.studentId !== user.uid,
          )
          .forEach((chat) => {
            const existing = matchesByStudent.get(chat.studentId) || {};
            matchesByStudent.set(chat.studentId, {
              ...existing,
              id: existing.id || chat.id,
              studentId: chat.studentId,
              studentName:
                existing.studentName || chat.studentName || "Student",
              mentorId: user.uid,
              status: existing.status || "matched",
              matchedAt: existing.matchedAt || chat.createdAt || chat.updatedAt,
              chatId: chat.id,
            });
          });

        const rows = Array.from(matchesByStudent.values()).sort(
          (first, second) =>
            new Date(second.matchedAt || 0) - new Date(first.matchedAt || 0),
        );
        if (active) setMatches(rows);
      } catch (loadError) {
        if (active)
          setError(
            loadError.message || "Could not load your matched students.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMatches();
    return () => {
      active = false;
    };
  }, [user?.uid]);

  const openStudentProfile = async (match) => {
    setSelectedMatch(match);
    setStudentProfile(null);
    setProfileError("");
    setProfileLoading(true);
    try {
      const studentId = String(
        match.studentId || match.student_id || match.mentee_id || "",
      );
      let profile = null;

      if (studentId) {
        const profileSnapshot = await getDoc(
          doc(db, "studentMentorshipProfiles", studentId),
        );
        if (profileSnapshot.exists()) {
          profile = { id: profileSnapshot.id, ...profileSnapshot.data() };
        }

        if (!profile) {
          const profileLookups = await Promise.allSettled(
            ["studentId", "student_id", "uid", "userId"].map((field) =>
              getDocs(
                query(
                  collection(db, "studentMentorshipProfiles"),
                  where(field, "==", studentId),
                ),
              ),
            ),
          );
          const matchingDoc = profileLookups
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value.docs[0])
            .find(Boolean);
          if (matchingDoc) {
            profile = { id: matchingDoc.id, ...matchingDoc.data() };
          }
        }
      }

      let chat = null;
      if (match.chatId) {
        const chatSnapshot = await getDoc(doc(db, "chats", match.chatId));
        if (chatSnapshot.exists()) chat = chatSnapshot.data();
      }

      setStudentProfile({
        ...(profile || {}),
        id: profile?.id || studentId,
        studentId,
        name:
          profile?.name || match.studentName || chat?.studentName || "Student",
        email: profile?.email || match.studentEmail || chat?.studentEmail || "",
      });
      if (!profile) {
        setProfileError(
          "This student has not completed a matching profile yet. Showing details available from the match or conversation.",
        );
      }
    } catch (loadError) {
      setProfileError(
        loadError.message || "Could not load the student's profile.",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const closeStudentProfile = () => {
    setSelectedMatch(null);
    setStudentProfile(null);
    setProfileError("");
  };

  const interests = asList(
    studentProfile?.interests ||
      studentProfile?.careerInterests ||
      studentProfile?.career_interests,
  );
  const skills = asList(studentProfile?.skills || studentProfile?.skillSet);

  return (
    <section
      id="mentor-match-center"
      className="mx-auto my-8 max-w-[1440px] px-5 md:px-10"
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 px-5 py-5 md:px-7">
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-teal-700">
              <UserRound size={15} /> Mentorship roster
            </p>
            <h2 className="text-xl font-extrabold text-slate-900">
              Students matched with you
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Students matched with you or who started a chat appear here. Open
              a profile to view their shared details.
            </p>
          </div>
          <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
            {loading
              ? "Loading"
              : `${matches.length} ${matches.length === 1 ? "student" : "students"}`}
          </div>
        </header>

        {loading ? (
          <p className="px-5 py-8 text-sm text-slate-500 md:px-7">
            Loading matched students…
          </p>
        ) : error ? (
          <p
            role="alert"
            className="m-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 md:m-7"
          >
            {error}
          </p>
        ) : matches.length === 0 ? (
          <div className="px-5 py-12 text-center md:px-7">
            <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500">
              <Search size={20} />
            </div>
            <h3 className="font-bold text-slate-800">
              No matched students yet
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Students matched and assigned to you will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {matches.map((match) => (
              <li key={match.id}>
                <button
                  type="button"
                  onClick={() => openStudentProfile(match)}
                  className="flex w-full flex-wrap items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700 md:px-7"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-teal-50 font-extrabold text-teal-800">
                      {(match.studentName || "S")
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-slate-900">
                        {match.studentName || "Student"}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                        {match.mentorSpecialization && (
                          <span className="inline-flex items-center gap-1">
                            <BookOpen size={12} />
                            {match.mentorSpecialization}
                          </span>
                        )}
                        {match.compatibilityScore !== undefined && (
                          <span className="inline-flex items-center gap-1">
                            <Award size={12} />
                            {Math.round(Number(match.compatibilityScore) || 0)}%
                            match
                          </span>
                        )}
                      </span>
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-teal-800">
                    View student profile
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedMatch && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
          onClick={closeStudentProfile}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="matched-student-name"
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 md:px-7">
              <div>
                <p className="mb-1 text-xs font-bold uppercase text-teal-700">
                  Matched student profile
                </p>
                <h2
                  id="matched-student-name"
                  className="text-xl font-extrabold text-slate-900"
                >
                  {studentProfile?.name ||
                    selectedMatch.studentName ||
                    "Student"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close student profile"
                onClick={closeStudentProfile}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </header>

            <div className="space-y-5 px-5 py-5 md:px-7">
              {profileLoading ? (
                <p className="text-sm text-slate-500">
                  Loading student details from Firebase…
                </p>
              ) : (
                studentProfile && (
                  <>
                    {profileError && (
                      <p
                        role="status"
                        className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800"
                      >
                        {profileError}
                      </p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ProfileField
                        icon={BookOpen}
                        label="Degree program"
                        value={
                          studentProfile.degreeProgram ||
                          studentProfile.degree_program ||
                          studentProfile.degree
                        }
                      />
                      <ProfileField
                        icon={BriefcaseBusiness}
                        label="Field of study"
                        value={
                          studentProfile.fieldOfStudy ||
                          studentProfile.field_of_study ||
                          studentProfile.stream
                        }
                      />
                      <ProfileField
                        icon={MapPin}
                        label="Location"
                        value={
                          studentProfile.location || studentProfile.district
                        }
                      />
                      <ProfileField
                        icon={Languages}
                        label="Languages"
                        value={
                          studentProfile.languages || studentProfile.language
                        }
                      />
                      <ProfileField
                        icon={BriefcaseBusiness}
                        label="Career goal"
                        value={
                          studentProfile.dreamJob ||
                          studentProfile.dream_job ||
                          studentProfile.careerGoal
                        }
                      />
                      <ProfileField
                        icon={UserRound}
                        label="Mentorship needs"
                        value={
                          studentProfile.mentorshipNeeds ||
                          studentProfile.mentorship_needs ||
                          studentProfile.mentoringGoals
                        }
                      />
                      <ProfileField
                        icon={BookOpen}
                        label="Qualifications"
                        value={
                          studentProfile.qualifications ||
                          studentProfile.highestDegree
                        }
                      />
                    </div>
                    <ProfileList label="Interests" values={interests} />
                    <ProfileList label="Skills" values={skills} />
                  </>
                )
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

const ProfileField = ({ icon: Icon, label, value }) => (
  <div className="min-w-0 border-b border-slate-100 pb-3">
    <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
      <Icon size={13} />
      {label}
    </p>
    <p className="break-words text-sm font-medium text-slate-800">
      {displayValue(value)}
    </p>
  </div>
);

const ProfileList = ({ label, values }) => (
  <div>
    <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">{label}</h3>
    {values.length === 0 ? (
      <p className="text-sm text-slate-600">Not provided</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
          >
            {value}
          </span>
        ))}
      </div>
    )}
  </div>
);

export default MentorMatchedStudents;
