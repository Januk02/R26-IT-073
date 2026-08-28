import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const SharedAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch student profile from Firestore
  const fetchStudentProfile = async (uid) => {
    try {
      const docRef = doc(db, 'students', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStudentProfile(docSnap.data());
      } else {
        setStudentProfile(null);
      }
    } catch (err) {
      console.error("Error fetching student profile:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchStudentProfile(currentUser.uid);
      } else {
        setStudentProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Shared Login Function
  const loginUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  // Shared Register Function (Creates Auth + Firestore Document)
  const registerStudent = async (formData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    await updateProfile(user, { displayName: fullName });

    const studentData = {
      uid: user.uid,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: fullName,
      email: formData.email,
      studentId: formData.studentId,
      phoneNumber: formData.phoneNumber || '',
      role: 'student',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      profile: {
        avatar: '',
        bio: '',
        grade: '',
        major: 'Software Engineering',
      }
    };

    await setDoc(doc(db, 'students', user.uid), studentData);
    setStudentProfile(studentData);
    return user;
  };

  // Shared Logout Function
  const logoutUser = async () => {
    await signOut(auth);
    setUser(null);
    setStudentProfile(null);
  };

  // Get Formatted Name
  const getDisplayName = () => {
    if (studentProfile?.fullName) return studentProfile.fullName;
    if (user?.displayName) return user.displayName;
    if (user?.email) {
      const namePart = user.email.split('@')[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return 'Guest Student';
  };

  return (
    <AuthContext.Provider value={{
      user,
      studentProfile,
      loading,
      loginUser,
      registerStudent,
      logoutUser,
      displayName: getDisplayName(),
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SharedAuthProvider');
  }
  return context;
};
