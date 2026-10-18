import { collection, getDocs } from "firebase/firestore";
import { db } from "../../src/firebase";

const normalizeStringList = (value) => {
  if (!value) return [];
  if (Array.isArray(value))
    return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string")
    return value
      .split(",")
      .map((item) => String(item).trim())
      .filter(Boolean);
  return [String(value).trim()].filter(Boolean);
};

const normalizeVerificationLevel = (mentor = {}) => {
  const rawTier =
    mentor.verificationLevel ||
    mentor.verification_level ||
    mentor.verificationTier ||
    mentor.verification_tier ||
    mentor.medalTier ||
    mentor.medal_tier ||
    mentor.tier;
  const normalizedTier = String(rawTier || "")
    .trim()
    .toLowerCase();

  if (normalizedTier.includes("platinum")) return "Platinum";
  if (normalizedTier.includes("gold")) return "Gold";
  if (normalizedTier.includes("silver")) return "Silver";
  if (normalizedTier.includes("bronze")) return "Bronze";

  const score = toNumber(
    mentor.combined_verification_score ||
      mentor.combinedVerificationScore ||
      mentor.verificationScore ||
      mentor.verification_score ||
      mentor.mentorCombinedScore ||
      mentor.score,
    0,
  );
  if (score >= 95) return "Platinum";
  if (score >= 80) return "Gold";
  if (score >= 65) return "Silver";
  if (score >= 50) return "Bronze";

  const status = String(
    mentor.mentorVerificationStatus ||
      mentor.verificationStatus ||
      mentor.verification_status ||
      "",
  ).toLowerCase();
  return status === "verified" ? "Silver" : "Bronze";
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toOptionalNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Fetch mentors directly from Firestore database
 * This bypasses the Python backend to avoid dummy data
 */
export const fetchMentorsFromFirestore = async () => {
  try {
    const mentorProfilesSnapshot = await getDocs(
      collection(db, "mentorProfiles"),
    );

    const formattedMentors = mentorProfilesSnapshot.docs
      .map((mentorDoc) => ({ ...mentorDoc.data(), id: mentorDoc.id }))
      .map((mentor) => {
        const expertise = normalizeStringList(
          mentor.expertise || mentor.specialization || mentor.domain,
        );
        const skills = normalizeStringList(
          mentor.skills ||
            mentor.expertise ||
            mentor.specialties ||
            mentor.skillSet ||
            mentor.skill_set ||
            mentor.tags ||
            [],
        );

        const verificationLevel = normalizeVerificationLevel(mentor);
        const combinedScore = toNumber(
          mentor.combined_verification_score ||
            mentor.combinedVerificationScore ||
            mentor.verificationScore ||
            mentor.verification_score ||
            mentor.mentorCombinedScore ||
            mentor.score ||
            0,
          0,
        );
        const mentorName =
          mentor.name ||
          mentor.displayName ||
          [mentor.firstName, mentor.lastName].filter(Boolean).join(" ") ||
          mentor.email?.split("@")[0] ||
          "Mentor";

        return {
          ...mentor,
          id: mentor.id || mentor.uid || mentor.userId || "mentor",
          uid: mentor.uid || mentor.userId || mentor.id || "mentor",
          mentor_id:
            mentor.mentor_id ||
            mentor.uid ||
            mentor.userId ||
            mentor.id ||
            "mentor",
          name: mentorName,
          email: mentor.email || mentor.userEmail || "",
          domain:
            mentor.specialization ||
            mentor.domain ||
            mentor.field ||
            expertise[0] ||
            "General",
          specialization:
            mentor.specialization ||
            mentor.domain ||
            mentor.field ||
            expertise[0] ||
            "General",
          industry_role:
            mentor.industryRole ||
            mentor.industry_role ||
            mentor.roleTitle ||
            mentor.profession ||
            "Specialist",
          university:
            mentor.university ||
            mentor.institution ||
            mentor.education ||
            "University",
          location:
            mentor.location ||
            mentor.city ||
            mentor.district ||
            mentor.address ||
            "Not specified",
          experience_years: toNumber(
            mentor.yearsExperience ||
              mentor.experience_years ||
              mentor.experience ||
              0,
            0,
          ),
          skills,
          availability_hours: toNumber(
            mentor.availabilityHours ||
              mentor.availability_hours ||
              mentor.availability ||
              4,
            4,
          ),
          languages: mentor.languages || mentor.language || "English",
          verification_level: verificationLevel,
          verification_status:
            mentor.mentorVerificationStatus ||
            mentor.verificationStatus ||
            mentor.verification_status ||
            verificationLevel,
          combined_verification_score: combinedScore,
          oral_assessment_score: toOptionalNumber(
            mentor.oralAssessmentScore ??
              mentor.aiOralAssessmentScore ??
              mentor.interviewScore,
          ),
          cv_skill_audit_score: toOptionalNumber(
            mentor.cvSkillAuditScore ??
              mentor.cvAndSkillAuditScore ??
              mentor.cvScore,
          ),
          overall_verification_score: toOptionalNumber(
            mentor.overallVerificationScore ??
              mentor.mentorCombinedScore ??
              mentor.combined_verification_score ??
              mentor.verificationScore,
          ),
          is_verified:
            ["Platinum", "Gold", "Silver"].includes(verificationLevel) ||
            mentor.isMentorVerified === true ||
            mentor.is_verified === true,
          avatar: mentorName
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase(),
          color: "#0F766E",
          highestDegree:
            mentor.highestDegree ||
            mentor.degree ||
            mentor.qualifications ||
            "",
          bio: mentor.bio || mentor.about || mentor.summary || "",
          profile_completed: mentor.profile_completed ?? true,
          expertise,
        };
      })
      .sort((a, b) => {
        const levelWeight = { Gold: 3, Silver: 2, Bronze: 1 };
        return (
          (levelWeight[b.verification_level] || 0) -
            (levelWeight[a.verification_level] || 0) ||
          (b.combined_verification_score || 0) -
            (a.combined_verification_score || 0)
        );
      });

    console.log(
      `✅ Loaded ${formattedMentors.length} mentors from readable Firestore mentor profiles`,
    );
    return formattedMentors;
  } catch (error) {
    console.error("Error fetching mentors from Firestore:", error);
    throw error;
  }
};

/**
 * Fetch mentees/students directly from Firestore database
 */
export const fetchMenteesFromFirestore = async () => {
  try {
    const menteesRef = collection(db, "studentMentorshipProfiles");
    const menteesSnapshot = await getDocs(menteesRef);

    const menteesData = menteesSnapshot.docs.map((doc) => ({
      id: doc.id,
      mentee_id: doc.id,
      student_id: doc.id,
      ...doc.data(),
    }));

    // Format mentee data
    const formattedMentees = menteesData.map((mentee) => {
      const interests = mentee.interests || [];
      const interestsArray = Array.isArray(interests)
        ? interests
        : typeof interests === "string"
          ? interests.split(",").map((s) => s.trim())
          : [];

      return {
        id: mentee.id,
        mentee_id: mentee.mentee_id,
        student_id: mentee.student_id,
        name: mentee.name || "Student",
        email: mentee.email || "",
        interests: interestsArray,
        location: mentee.location || "Not specified",
        university: mentee.university || "University",
        field_of_study:
          mentee.fieldOfStudy || mentee.degreeProgram || "General",
        available_hours: mentee.availableHours || mentee.available_hours || 4,
        languages: mentee.languages || "English",
        year_of_study: mentee.yearOfStudy || 2,
        gpa: mentee.gpa || 3.0,
        dreamJob: mentee.dreamJob || "",
        skills: mentee.skills || [],
      };
    });

    console.log(`✅ Loaded ${formattedMentees.length} mentees from Firestore`);
    return formattedMentees;
  } catch (error) {
    console.error("Error fetching mentees from Firestore:", error);
    throw error;
  }
};

/**
 * Get platform statistics from Firestore
 */
export const getFirestoreStats = async () => {
  try {
    const [mentors, mentees] = await Promise.all([
      fetchMentorsFromFirestore(),
      fetchMenteesFromFirestore(),
    ]);

    // Domain distribution
    const mentorDomains = {};
    mentors.forEach((m) => {
      const domain = m.domain || "General";
      mentorDomains[domain] = (mentorDomains[domain] || 0) + 1;
    });

    // Verification levels
    const verificationDist = {};
    mentors.forEach((m) => {
      const level = normalizeVerificationLevel(m) || "Bronze";
      verificationDist[level] = (verificationDist[level] || 0) + 1;
    });

    // Universities
    const universities = new Set(
      mentors.map((m) => m.university).filter(Boolean),
    );

    return {
      total_mentors: mentors.length,
      total_mentees: mentees.length,
      mentor_domains: mentorDomains,
      verification_distribution: verificationDist,
      universities_represented: universities.size,
      mentors_count: mentors.length,
      mentees_count: mentees.length,
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    throw error;
  }
};
