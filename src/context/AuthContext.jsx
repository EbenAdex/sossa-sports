import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
} from "firebase/auth";
import { auth } from "../firebase";
import {
  createUserProfile,
  ensureUserProfile,
  updateUserProfile,
} from "../services/profileService";

const AuthContext = createContext();

const ADMIN_EMAIL = "admin@sossamania.com";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_STORAGE_KEY = "sossamaniaAdminOverride";
const REMEMBERED_EMAIL_KEY = "sossamaniaRememberedEmail";
const LAST_ACTIVITY_KEY = "sossamaniaLastActivity";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [adminOverride, setAdminOverride] = useState(
    localStorage.getItem(ADMIN_STORAGE_KEY) === "true"
  );

  const logoutInProgressRef = useRef(false);

  const markActivity = () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  };

  const clearSessionMeta = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  };

  const logout = async () => {
    if (logoutInProgressRef.current) return;

    logoutInProgressRef.current = true;

    try {
      clearSessionMeta();
      setAdminOverride(false);
      setUser(null);
      setHasRegistered(false);

      if (auth.currentUser) {
        await signOut(auth);
      }
    } finally {
      logoutInProgressRef.current = false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const profile = await ensureUserProfile({
            email: firebaseUser.email,
            fullName: firebaseUser.displayName || "N/A",
            department: "N/A",
            level: "N/A",
            role: "user",
            accountType: "user",
          });

          setUser({
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            role: profile?.role || "user",
            fullName: profile?.fullName || "N/A",
            department: profile?.department || "N/A",
            level: profile?.level || "N/A",
            accountType: profile?.accountType || "user",
          });

          setHasRegistered(true);
          markActivity();
        } else if (localStorage.getItem(ADMIN_STORAGE_KEY) === "true") {
          setUser({
            email: ADMIN_EMAIL,
            role: "admin",
            fullName: "SossaMania Admin",
            department: "N/A",
            level: "N/A",
            accountType: "user",
          });
          setHasRegistered(true);
          setAdminOverride(true);
          markActivity();
        } else {
          setUser(null);
          setHasRegistered(false);
          setAdminOverride(false);
        }
      } catch (error) {
        console.error("Auth state profile load failed:", error);
        setUser(null);
        setHasRegistered(false);
        setAdminOverride(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];

    const handleActivity = () => {
      markActivity();
    };

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity);
    });

    const interval = setInterval(async () => {
      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);
      const inactiveTooLong = !lastActivity || Date.now() - lastActivity > SESSION_TIMEOUT_MS;

      if (inactiveTooLong) {
        await logout();
      }
    }, 60 * 1000);

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      clearInterval(interval);
    };
  }, [user]);

  const register = async ({
    email,
    password,
    fullName,
    department,
    level,
    accountType = "user",
  }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await createUserProfile({
      fullName,
      email,
      department,
      level,
      role: "user",
      accountType,
    });

    markActivity();
    return userCredential.user;
  };

  const login = async ({ email, password }) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_STORAGE_KEY, "true");

      const adminUser = {
        email: ADMIN_EMAIL,
        role: "admin",
        fullName: "SossaMania Admin",
        department: "N/A",
        level: "N/A",
        accountType: "user",
      };

      setAdminOverride(true);
      setUser(adminUser);
      setHasRegistered(true);
      markActivity();

      return { isAdminOverride: true, user: adminUser };
    }

    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setAdminOverride(false);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const profile = await ensureUserProfile({
      email: firebaseUser.email,
      fullName: firebaseUser.displayName || "N/A",
      department: "N/A",
      level: "N/A",
      role: "user",
      accountType: "user",
    });

    const mergedUser = {
      email: firebaseUser.email,
      uid: firebaseUser.uid,
      role: profile?.role || "user",
      fullName: profile?.fullName || "N/A",
      department: profile?.department || "N/A",
      level: profile?.level || "N/A",
      accountType: profile?.accountType || "user",
    };

    setUser(mergedUser);
    setHasRegistered(true);
    markActivity();

    return mergedUser;
  };

  const updateProfile = async (updates) => {
    if (!user?.email) {
      throw new Error("No active user profile found.");
    }

    await updateUserProfile(user.email, updates);

    setUser((prev) => ({
      ...prev,
      ...updates,
    }));

    markActivity();
  };

  const changePassword = async (newPassword) => {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found.");
    }

    await updatePassword(auth.currentUser, newPassword);
    markActivity();
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const rememberEmail = (email) => {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
  };

  const forgetRememberedEmail = () => {
    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  };

  const isAdmin = adminOverride || user?.role === "admin" || user?.email === ADMIN_EMAIL;

  const value = useMemo(
    () => ({
      user,
      loading,
      hasRegistered,
      adminOverride,
      isAdmin,
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      resetPassword,
      rememberEmail,
      forgetRememberedEmail,
      rememberedEmail: localStorage.getItem(REMEMBERED_EMAIL_KEY) || "",
    }),
    [user, loading, hasRegistered, adminOverride, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}