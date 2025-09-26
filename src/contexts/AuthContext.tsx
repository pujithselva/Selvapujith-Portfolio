import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../../firebase';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Admin',
          isAdmin: true // You can add additional admin verification logic here
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        console.error('Login error: Email and password are required');
        return false;
      }
      
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide more specific error messages
      if (error.code === 'auth/invalid-credential') {
        console.error('Invalid credentials. Please check your email and password.');
      } else if (error.code === 'auth/user-not-found') {
        console.error('No user found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        console.error('Incorrect password.');
      } else if (error.code === 'auth/invalid-email') {
        console.error('Invalid email address format.');
      } else if (error.code === 'auth/network-request-failed') {
        console.error('Network error. Please check your internet connection.');
      }
      
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};