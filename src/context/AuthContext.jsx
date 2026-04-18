import { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      // Map Clerk metadata to app user structure
      const metadata = clerkUser.unsafeMetadata || {};
      setUser({
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || 'User',
        email: clerkUser.primaryEmailAddress?.emailAddress,
        role: metadata.role || 'user', // Default to 'user'
        capabilities: metadata.capabilities || null,
        clerkUser: clerkUser, // Reference to original clerk user
      });
    } else if (isLoaded && !isSignedIn) {
      setUser(null);
    }
  }, [clerkUser, isLoaded, isSignedIn]);

  const updateMetadata = async (metadata) => {
    if (!clerkUser) return;
    try {
      await clerkUser.update({
        unsafeMetadata: {
          ...clerkUser.unsafeMetadata,
          ...metadata,
        },
      });
    } catch (err) {
      console.error("Failed to update metadata:", err);
      throw err;
    }
  };

  const syncUserWithDatabase = async (userData) => {
    try {
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          name: clerkUser.fullName || clerkUser.firstName,
          ...userData
        }),
      });
      return await response.json();
    } catch (err) {
      console.error("Failed to sync user with database:", err);
    }
  };

  const logout = async () => {
    await signOut();
  };

  // Note: login and register are now handled by Clerk components
  // but we keep the context shape for compatibility where possible
  const login = () => {
    console.warn("Manual login called. Use Clerk SignIn instead.");
  };

  const register = () => {
    console.warn("Manual register called. Use Clerk SignUp instead.");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoaded, 
      isSignedIn, 
      login, 
      register, 
      logout,
      updateMetadata,
      syncUserWithDatabase,
      openUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
