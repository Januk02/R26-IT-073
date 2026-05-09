import React, { createContext, useState, useContext, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Create the invisible "cloud"
const CareerContext = createContext<any>(null);

export const CareerProvider = ({ children }: { children: React.ReactNode }) => {
    // The global variables shared between your tabs
    const [latestSGI, setLatestSGI] = useState<number>(0);
    const [readiness, setReadiness] = useState<number>(0);
    const [recentPathways, setRecentPathways] = useState<any[]>([]);

    useEffect(() => {
        fetchUserPathways();
    }, []);

    const fetchUserPathways = async () => {
        try {
            // For now, if no auth user is logged in, we use a generic 'guest' uid
            // In a real app, you'd wrap this in an auth state listener
            const uid = auth.currentUser?.uid || 'guest_user';
            
            const pathwaysRef = collection(db, 'users', uid, 'pathways');
            const q = query(pathwaysRef, orderBy('date', 'desc'), limit(10));
            
            const querySnapshot = await getDocs(q);
            const fetchedPaths: any[] = [];
            
            querySnapshot.forEach((doc) => {
                fetchedPaths.push({ id: doc.id, ...doc.data() });
            });

            if (fetchedPaths.length > 0) {
                setRecentPathways(fetchedPaths);
                setLatestSGI(fetchedPaths[0].matchScore || fetchedPaths[0].sgi_score);
                setReadiness(fetchedPaths[0].market_readiness || 85);
            }
        } catch (error) {
            console.error("Error fetching pathways from Firebase:", error);
        }
    };

    const saveNewPathway = async (pathwayData: any) => {
        try {
            const uid = auth.currentUser?.uid || 'guest_user';
            const enrichedData = {
                ...pathwayData,
                date: new Date().toISOString()
            };

            // Save to Firebase
            const pathwaysRef = collection(db, 'users', uid, 'pathways');
            const docRef = await addDoc(pathwaysRef, enrichedData);
            
            // Update local state instantly for snappy UI
            const newDoc = { id: docRef.id, ...enrichedData };
            setLatestSGI(newDoc.matchScore || newDoc.sgi_score);
            setReadiness(newDoc.market_readiness || 85);
            setRecentPathways(prev => [newDoc, ...prev]);
            
            return true;
        } catch (error) {
            console.error("Error saving pathway to Firebase:", error);
            return false;
        }
    };

    return (
        <CareerContext.Provider value={{ latestSGI, readiness, recentPathways, saveNewPathway, fetchUserPathways }}>
            {children}
        </CareerContext.Provider>
    );
};

// Custom hook to easily grab data in any file
export const useCareerData = () => useContext(CareerContext);