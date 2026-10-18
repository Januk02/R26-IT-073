import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

const syncMentorMatchingProfile = async (uid, userData) => {
  let interviewRecord = null;
  let cvRecord = null;

  try {
    const [interviewSnapshot, cvSnapshot] = await Promise.all([
      getDocs(
        query(collection(db, "verifications"), where("mentorId", "==", uid)),
      ),
      getDocs(
        query(collection(db, "cvVerifications"), where("mentorId", "==", uid)),
      ),
    ]);

    interviewRecord = interviewSnapshot.docs
      .map((record) => record.data())
      .reduce(
        (best, current) =>
          !best || Number(current.overallScore) > Number(best.overallScore)
            ? current
            : best,
        null,
      );
    cvRecord =
      cvSnapshot.docs
        .map((record) => record.data())
        .sort(
          (first, second) =>
            new Date(second.uploadedAt || 0) - new Date(first.uploadedAt || 0),
        )[0] || null;
  } catch (error) {
    console.warn("Could not load existing mentor assessment scores:", error);
  }

  const oralAssessmentScore = Number.isFinite(
    Number(interviewRecord?.overallScore),
  )
    ? Math.round(Number(interviewRecord.overallScore))
    : (userData.oralAssessmentScore ?? null);
  const cvSkillAuditScore = Number.isFinite(Number(cvRecord?.overallScore))
    ? Math.round(Number(cvRecord.overallScore))
    : (userData.cvSkillAuditScore ?? null);
  const calculatedOverall =
    oralAssessmentScore !== null && cvSkillAuditScore !== null
      ? Math.round(oralAssessmentScore * 0.6 + cvSkillAuditScore * 0.4)
      : null;
  const rawScore =
    calculatedOverall ??
    userData.mentorCombinedScore ??
    userData.combined_verification_score ??
    userData.verificationScore ??
    userData.verification_score;
  const score = Number(rawScore);
  const hasScore = Number.isFinite(score);
  const explicitLevel =
    userData.verificationLevel ||
    userData.verification_level ||
    userData.medalTier ||
    userData.medal_tier;
  const verificationLevel =
    explicitLevel ||
    (hasScore
      ? score >= 95
        ? "Platinum"
        : score >= 80
          ? "Gold"
          : score >= 65
            ? "Silver"
            : score >= 50
              ? "Bronze"
              : "Participant"
      : userData.mentorVerificationStatus === "verified"
        ? "Silver"
        : null);

  const profile = {
    uid,
    mentor_id: uid,
    ...(userData.name || userData.displayName
      ? { name: userData.name || userData.displayName }
      : {}),
    ...(userData.specialization || userData.field
      ? { specialization: userData.specialization || userData.field }
      : {}),
    ...(userData.expertise ? { expertise: userData.expertise } : {}),
    ...(userData.industryRole || userData.industry_role
      ? { industryRole: userData.industryRole || userData.industry_role }
      : {}),
    ...(userData.university ? { university: userData.university } : {}),
    ...(userData.location ? { location: userData.location } : {}),
    ...(userData.yearsExperience || userData.experience_years
      ? {
          yearsExperience:
            userData.yearsExperience || userData.experience_years,
        }
      : {}),
    ...(userData.skills ? { skills: userData.skills } : {}),
    ...(userData.qualifications
      ? { qualifications: userData.qualifications }
      : {}),
    ...(userData.languages ? { languages: userData.languages } : {}),
    ...(userData.availabilityHours
      ? { availabilityHours: userData.availabilityHours }
      : {}),
    ...(userData.bio ? { bio: userData.bio } : {}),
    ...(oralAssessmentScore !== null ? { oralAssessmentScore } : {}),
    ...(cvSkillAuditScore !== null ? { cvSkillAuditScore } : {}),
    ...(calculatedOverall !== null
      ? { overallVerificationScore: calculatedOverall }
      : userData.overallVerificationScore !== undefined
        ? { overallVerificationScore: userData.overallVerificationScore }
        : {}),
    ...(verificationLevel
      ? {
          verificationLevel,
          verification_level: verificationLevel,
          isMentorVerified:
            userData.isMentorVerified === true ||
            userData.mentorVerificationStatus === "verified",
        }
      : {}),
    ...(hasScore
      ? {
          verificationScore: Math.round(score),
          combined_verification_score: Math.round(score),
          mentorCombinedScore: Math.round(score),
        }
      : {}),
    ...(userData.oralAssessmentScore !== undefined
      ? { oralAssessmentScore: userData.oralAssessmentScore }
      : {}),
    ...(userData.cvSkillAuditScore !== undefined
      ? { cvSkillAuditScore: userData.cvSkillAuditScore }
      : {}),
    ...(userData.overallVerificationScore !== undefined
      ? { overallVerificationScore: userData.overallVerificationScore }
      : {}),
    ...(userData.mentorVerificationStatus
      ? {
          mentorVerificationStatus: userData.mentorVerificationStatus,
          verification_status: userData.mentorVerificationStatus,
        }
      : {}),
  };

  if (Object.keys(profile).length > 2) {
    await setDoc(doc(db, "mentorProfiles", uid), profile, { merge: true });
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children, onAuthChange }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setUserRole(null);
        setLoading(false);
        if (onAuthChange) onAuthChange(false, null);
        return;
      }

      try {
        // 1. Check users collection (mentors / generic users)
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role || "mentor";
          if (role === "mentor") {
            syncMentorMatchingProfile(currentUser.uid, userData).catch(
              (error) => {
                console.warn(
                  "Could not sync mentor verification profile:",
                  error,
                );
              },
            );
          }
          setUserRole(role);
          if (onAuthChange) onAuthChange(true, role);
          setLoading(false);
          return;
        }

        // 2. Check mentors collection
        const mentorDoc = await getDoc(doc(db, "mentors", currentUser.uid));
        if (mentorDoc.exists()) {
          const role = mentorDoc.data().role || "mentor";
          setUserRole(role);
          if (onAuthChange) onAuthChange(true, role);
          setLoading(false);
          return;
        }

        // 3. Check students collection
        const studentDoc = await getDoc(doc(db, "students", currentUser.uid));
        if (studentDoc.exists()) {
          const role = studentDoc.data().role || "student";
          setUserRole(role);
          if (onAuthChange) onAuthChange(true, role);
          setLoading(false);
          return;
        }

        // 4. Fallback to cached role from login selection or default to mentor if ambiguous
        const cachedRole =
          sessionStorage.getItem("last_login_role") || "mentor";
        setUserRole(cachedRole);
        if (onAuthChange) onAuthChange(true, cachedRole);
      } catch (error) {
        console.error("Error fetching user role:", error);
        const cachedRole =
          sessionStorage.getItem("last_login_role") || "mentor";
        setUserRole(cachedRole);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [onAuthChange]);

  const login = async (email, password, roleHint = null) => {
    try {
      if (roleHint) {
        sessionStorage.setItem("last_login_role", roleHint);
      }
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const loggedUser = userCredential.user;

      if (roleHint) {
        const collectionName = roleHint === "student" ? "students" : "users";
        try {
          const uDoc = await getDoc(doc(db, collectionName, loggedUser.uid));
          if (!uDoc.exists()) {
            await setDoc(doc(db, collectionName, loggedUser.uid), {
              uid: loggedUser.uid,
              email: loggedUser.email || email,
              role: roleHint,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn("Could not auto-provision user document:", e);
        }
        setUserRole(roleHint);
      }

      return { success: true, user: loggedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const { email, password, role, ...additionalData } = userData;
      if (role) {
        sessionStorage.setItem("last_login_role", role);
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Determine collection based on role
      const collectionName = role === "student" ? "students" : "users";

      // Store user data in Firestore
      await setDoc(doc(db, collectionName, user.uid), {
        uid: user.uid,
        email: email,
        role: role,
        createdAt: new Date().toISOString(),
        ...additionalData,
      });

      setUserRole(role);

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async (roleHint = null) => {
    try {
      if (roleHint) {
        sessionStorage.setItem("last_login_role", roleHint);
      }
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user exists in users collection (mentors)
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role || "mentor";
        setUserRole(role);
        return { success: true, user, isNewUser: false };
      }

      // Check if user exists in students collection
      const studentDoc = await getDoc(doc(db, "students", user.uid));
      if (studentDoc.exists()) {
        const role = studentDoc.data().role || "student";
        setUserRole(role);
        return { success: true, user, isNewUser: false };
      }

      // If roleHint is provided for new user, auto-register
      if (roleHint) {
        const collectionName = roleHint === "student" ? "students" : "users";
        await setDoc(doc(db, collectionName, user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: roleHint,
          createdAt: new Date().toISOString(),
        });
        setUserRole(roleHint);
        return { success: true, user, isNewUser: false };
      }

      // If new user and no roleHint, ask for role selection
      return { success: true, user, isNewUser: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const completeGoogleRegistration = async (role, additionalData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "No authenticated user" };
      }

      sessionStorage.setItem("last_login_role", role);
      // Determine collection based on role
      const collectionName = role === "student" ? "students" : "users";

      await setDoc(doc(db, collectionName, user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: role,
        createdAt: new Date().toISOString(),
        ...additionalData,
      });

      setUserRole(role);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem("last_login_role");
      await signOut(auth);
      setUserRole(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userRole,
    loading,
    login,
    register,
    loginWithGoogle,
    completeGoogleRegistration,
    logout,
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8faff",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: "4px solid #bfdbfe",
            borderTopColor: "#1d4ed8",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
