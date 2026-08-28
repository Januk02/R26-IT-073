import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { db, auth } from '../../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, limit, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const CareerContext = createContext(null);

export const CareerProvider = ({ children }) => {
    const [user, setUser] = useState(auth.currentUser);
    const [recentPathways, setRecentPathways] = useState([]);
    const [selectedPathway, setSelectedPathway] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const latestSGI = selectedPathway ? (selectedPathway.matchScore || selectedPathway.sgi_score || 0) : 0;
    const readiness = selectedPathway ? (selectedPathway.market_readiness || 0) : 0;

    // Helper to get formatted display name
    const getUserDisplayName = () => {
        if (!user || user.isAnonymous) return 'Guest Student';
        if (user.displayName) return user.displayName;
        if (user.email) {
            const namePart = user.email.split('@')[0];
            return namePart.charAt(0).toUpperCase() + namePart.slice(1);
        }
        return 'Student';
    };

    const userName = getUserDisplayName();

    const fetchUserPathways = useCallback(async (currentUid) => {
        setIsLoading(true);
        try {
            const uid = currentUid || auth.currentUser?.uid || 'guest_user';
            const pathwaysRef = collection(db, 'users', uid, 'pathways');
            const q = query(pathwaysRef, orderBy('date', 'desc'), limit(20));
            
            const querySnapshot = await getDocs(q);
            const fetchedPaths = [];
            
            querySnapshot.forEach((docSnap) => {
                fetchedPaths.push({ id: docSnap.id, ...docSnap.data() });
            });

            if (fetchedPaths.length > 0) {
                setRecentPathways(fetchedPaths);
                setSelectedPathway(fetchedPaths[0]);
            } else {
                setRecentPathways([]);
                setSelectedPathway(null);
            }
        } catch (error) {
            console.error("Error fetching pathways from Firebase:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            fetchUserPathways(currentUser?.uid);
        });
        return () => unsubscribe();
    }, [fetchUserPathways]);

    const saveNewPathway = async (pathwayData) => {
        try {
            const uid = auth.currentUser?.uid || 'guest_user';
            const enrichedData = {
                ...pathwayData,
                date: new Date().toISOString()
            };

            const pathwaysRef = collection(db, 'users', uid, 'pathways');
            const docRef = await addDoc(pathwaysRef, enrichedData);
            
            const newDoc = { id: docRef.id, ...enrichedData };
            setRecentPathways(prev => [newDoc, ...prev]);
            setSelectedPathway(newDoc);
            
            return true;
        } catch (error) {
            console.error("Error saving pathway to Firebase:", error);
            return false;
        }
    };

    const deletePathway = async (pathwayId) => {
        try {
            const uid = auth.currentUser?.uid || 'guest_user';
            await deleteDoc(doc(db, 'users', uid, 'pathways', pathwayId));
            
            setRecentPathways(prev => {
                const updated = prev.filter(p => p.id !== pathwayId);
                if (updated.length > 0) {
                    if (selectedPathway?.id === pathwayId) {
                        setSelectedPathway(updated[0]);
                    }
                } else {
                    setSelectedPathway(null);
                }
                return updated;
            });
            return true;
        } catch (error) {
            console.error("Error deleting pathway:", error);
            return false;
        }
    };

    const updatePathwayProgress = async (pathwayId, updatedData) => {
        // Optimistic local update
        setRecentPathways(prev => prev.map(p => p.id === pathwayId ? { ...p, ...updatedData } : p));
        if (selectedPathway && selectedPathway.id === pathwayId) {
            const newPathway = { ...selectedPathway, ...updatedData };
            setSelectedPathway(newPathway);
        }

        // Persist to Firebase
        try {
            const uid = auth.currentUser?.uid || 'guest_user';
            await updateDoc(doc(db, 'users', uid, 'pathways', pathwayId), updatedData);
        } catch (error) {
            console.error("Error updating pathway in Firebase:", error);
        }
    };

    return (
        <CareerContext.Provider value={{ 
            user,
            userName,
            latestSGI, 
            readiness, 
            recentPathways, 
            selectedPathway, 
            setSelectedPathway,
            saveNewPathway,
            deletePathway,
            fetchUserPathways,
            updatePathwayProgress,
            isLoading
        }}>
            {children}
        </CareerContext.Provider>
    );
};

export const useCareerData = () => {
    const context = useContext(CareerContext);
    if (!context) {
        throw new Error('useCareerData must be used within a CareerProvider');
    }
    return context;
};
