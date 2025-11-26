import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: {
    language: string;
    region: string;
    contentFilter: boolean;
  };
  joinedAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  exportUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUser(docSnap.data() as UserProfile);
        } else {
          // Fallback if doc doesn't exist (shouldn't happen in normal flow)
          console.error("User document not found!");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const newUser: UserProfile = {
      id: firebaseUser.uid,
      email,
      name,
      preferences: {
        language: 'en',
        region: 'US',
        contentFilter: false,
      },
      joinedAt: new Date().toISOString(),
    };

    // Create user document in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    setUser(newUser);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!auth.currentUser) return;
    
    const docRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(docRef, data);
    
    // Update local state
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) return;
    
    const uid = auth.currentUser.uid;
    
    // Delete Firestore document
    await deleteDoc(doc(db, 'users', uid));
    
    // Delete Auth user
    await auth.currentUser.delete();
  };

  const exportUserData = async () => {
    if (!user) return;
    
    // In a real app, you'd fetch all subcollections here
    // For now, we'll just export the profile
    const exportData = {
      profile: user,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ecoutons_data_${user.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      login, 
      signup, 
      logout, 
      updateProfile, 
      deleteAccount,
      exportUserData 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
