import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import API_BASE_URL from "../apiConfig";
import LoadingScreen from "../components/LoadingScreen";
import { LogOut } from "lucide-react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasExpenses, setHasExpenses] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchUserProfile = useCallback(async (phone) => {
    if (!phone) return null;
    try {
      const response = await fetch(
        `${API_BASE_URL}/fetch-profile.php?phone=${phone}`,
      );
      if (!response.ok) throw new Error("Server down");

      const data = await response.json();

      if (isMounted.current && !data.error) {
        let userNiches = [];
        try {
          userNiches = data.categories
            ? JSON.parse(data.categories)
            : data.category
              ? [data.category]
              : [];
        } catch (e) {
          userNiches = [data.category || "General"];
        }

        const userData = {
          phone: phone,
          fullname: data.fullname,
          firstName: data.fullname ? data.fullname.split(" ")[0] : "CEO",
          bname: data.bname,
          categories: userNiches,
          is_verified: parseInt(data.is_verified) || 0,
          salesGoal: parseFloat(data.salesGoal) || 500000,
          profilePic: data.profilePic,
        };

        setUser(userData);
        if (data.onboarding_step !== undefined) {
          setOnboardingStep(parseInt(data.onboarding_step));
        }
        return userData;
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
    return null;
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/check-auth.php`, {
          credentials: "include",
        });
        const data = await response.json();

        if (isMounted.current) {
          if (data.authenticated && data.user?.phone) {
            // CRITICAL: Set the step from the DATABASE immediately
            const dbStep = parseInt(data.user.onboarding_step) || 0;

            // If they are already in the PWA, don't let them see Step 1 (Install)
            const finalStep = dbStep === 1 && isRunningInPWA() ? 2 : dbStep;

            setOnboardingStep(finalStep);

            // Fetch the profile but DON'T let the user see the app until this is done
            await fetchUserProfile(data.user.phone);
          } else {
            setUser(null);
            setOnboardingStep(0);
          }
        }
      } catch (err) {
        console.error("Auth init failed", err);
      } finally {
        if (isMounted.current) {
          // Only stop the loading spinner once EVERYTHING is set
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, [fetchUserProfile]);

  const login = async (phone, password) => {
    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("password", password);

    try {
      const response = await fetch(`${API_BASE_URL}/verify-vendor.php`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (data.status === "success") {
        setOnboardingStep(data.onboarding_step);
        await fetchUserProfile(data.phone);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const completeStep = async (stepNumber, jumpTo = null) => {
    const nextStep = jumpTo !== null ? jumpTo : stepNumber + 1;
    setOnboardingStep(nextStep);

    if (user?.phone) {
      const formData = new FormData();
      formData.append("phone", user.phone);
      formData.append("step", nextStep);

      try {
        await fetch(`${API_BASE_URL}/update-onboarding.php`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
      } catch (e) {
        console.error("Failed to sync onboarding step", e);
      }
    }
  };

  const triggerAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        completeStep(1);
        setDeferredPrompt(null);
      }
    } else {
      completeStep(1);
    }
  };

  const isRunningInPWA = () => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://")
    );
  };

  const logout = useCallback(() => {
    setUser(null);
    setOnboardingStep(0);
    setHasExpenses(null);
  }, []);

  const updateUser = useCallback((newData) => {
    setUser((prev) => (prev ? { ...prev, ...newData } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        isRunningInPWA,
        loading,
        onboardingStep,
        logout,
        updateUser,
        completeStep,
        triggerAndroidInstall,
        hasExpenses,
        setHasExpenses,
        deferredPrompt,
      }}>
      {!loading ? children : <LoadingScreen />}
    </AuthContext.Provider>
  );
};
