import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children, onAuthChange }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (!user) {
        setUserRole(null);
        setLoading(false);
        if (onAuthChange) onAuthChange(false, null);
        return;
      }

      // Resolve loading immediately — role fetched in background
      setLoading(false);

      const fetchRole = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            setUserRole(role);
            if (onAuthChange) onAuthChange(true, role);
            return;
          }
          const studentDoc = await getDoc(doc(db, 'students', user.uid));
          if (studentDoc.exists()) {
            const role = studentDoc.data().role;
            setUserRole(role);
            if (onAuthChange) onAuthChange(true, role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      };

      fetchRole();
    });

    return unsubscribe;
  }, [onAuthChange]);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const { email, password, role, ...additionalData } = userData;
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Determine collection based on role
      const collectionName = role === 'student' ? 'students' : 'users';

      // Store user data in Firestore
      await setDoc(doc(db, collectionName, user.uid), {
        uid: user.uid,
        email: email,
        role: role,
        createdAt: new Date().toISOString(),
        ...additionalData
      });

      setUserRole(role);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user exists in users collection (mentors)
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
        return { success: true, user, isNewUser: false };
      }

      // Check if user exists in students collection
      const studentDoc = await getDoc(doc(db, 'students', user.uid));
      if (studentDoc.exists()) {
        setUserRole(studentDoc.data().role);
        return { success: true, user, isNewUser: false };
      }

      // If new user, ask for role selection
      return { success: true, user, isNewUser: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const completeGoogleRegistration = async (role, additionalData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'No authenticated user' };
      }

      // Determine collection based on role
      const collectionName = role === 'student' ? 'students' : 'users';

      await setDoc(doc(db, collectionName, user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: role,
        createdAt: new Date().toISOString(),
        ...additionalData
      });

      setUserRole(role);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
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
    logout
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f8faff',
      }}>
        <div style={{
          width: 44, height: 44,
          border: '4px solid #bfdbfe', borderTopColor: '#1d4ed8',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
