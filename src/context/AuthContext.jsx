import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout as fbLogout,
  onAuthChange,
  subscribeUserDoc,
} from '../firebase/auth';

export const AuthContext = createContext(null);

const toastStyle = {
  style: {
    background: '#1e293b',
    color: '#f8fafc',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '16px',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setUserDoc(null);
        setLoading(false);
      }
      // Note: We removed the double subscription here.
      // The second useEffect below will handle fetching the user doc
      // once `user` state is set, preventing memory leaks!
    });

    return unsubscribe;
  }, []);

  // Subscribe to Firestore user document
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeUserDoc(user.uid, (doc) => {
      setUserDoc(doc);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Register
  const register = async (email, password, displayName) => {
    try {
      const newUser = await registerWithEmail(
        email,
        password,
        displayName
      );

      toast.success(
        'Account created! Welcome to LUXE 🎉',
        toastStyle
      );

      return newUser;
    } catch (error) {
      toast.error(friendly(error.code), toastStyle);
      throw error;
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const { user: loggedUser } = await loginWithEmail(
        email,
        password
      );

      toast.success(
        `Welcome back, ${loggedUser.displayName || loggedUser.email
        }!`,
        toastStyle
      );

      return loggedUser;
    } catch (error) {
      toast.error(friendly(error.code), toastStyle);
      throw error;
    }
  };

  // Google Login
  const loginGoogle = async (mode = 'login') => {
    try {
      const googleUser = await loginWithGoogle(mode);

      toast.success(
        `Welcome, ${googleUser.displayName}! 🎉`,
        toastStyle
      );

      return googleUser;
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(friendly(error.code), toastStyle);
      }

      throw error;
    }
  };

  // Logout
  const logout = async () => {
    await fbLogout();

    toast('Signed out. See you soon! 👋', {
      icon: '🔑',
      style: {
        background: '#1e293b',
        color: '#f8fafc',
        borderRadius: '16px',
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userDoc,
        loading,

        isAdmin: userDoc?.role?.trim() === 'admin',
        isLoggedIn: !!user,

        register,
        login,
        loginGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  return useContext(AuthContext);
}

// Friendly Firebase Errors
function friendly(code) {
  const messages = {
    'auth/not-registered':
      'Account not found. Please sign up first.',

    'auth/email-already-in-use':
      'That email is already registered.',

    'auth/user-not-found':
      'No account found with this email.',

    'auth/wrong-password':
      'Incorrect password. Try again.',

    'auth/invalid-email':
      'Please enter a valid email address.',

    'auth/weak-password':
      'Password must be at least 6 characters.',

    'auth/too-many-requests':
      'Too many attempts. Please try again later.',

    'auth/invalid-credential':
      'Invalid credentials. Please try again.',
  };

  return (
    messages[code] ||
    'Something went wrong. Please try again.'
  );
}