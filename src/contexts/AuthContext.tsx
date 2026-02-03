import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResult {
  error?: { message: string } | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const stored = localStorage.getItem('aspire_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    // Mock authentication
    const mockUser: User = {
      id: 'user-1',
      email,
      name: email.split('@')[0],
    };
    setUser(mockUser);
    localStorage.setItem('aspire_user', JSON.stringify(mockUser));
    return { error: null };
  };

  const signUp = async (email: string, password: string, name?: string): Promise<AuthResult> => {
    // Mock registration
    const mockUser: User = {
      id: 'user-' + Date.now(),
      email,
      name: name || email.split('@')[0],
    };
    setUser(mockUser);
    localStorage.setItem('aspire_user', JSON.stringify(mockUser));
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('aspire_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
