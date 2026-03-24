import React, { createContext, useState, useEffect, useCallback } from "react";
import API_BASE_URL from "../apiConfig";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasExpenses, setHasExpenses] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(0); // Starts at 0, updated by DB
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  // Updated to save to Server
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

  const fetchUserProfile = useCallback(async (phone) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/fetch-profile.php?phone=${phone}`,
      );
      const data = await response.json();

      if (!data.error) {
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
        // Sync onboarding step from profile data if exists
        if (data.onboarding_step !== undefined)
          setOnboardingStep(parseInt(data.onboarding_step));
        return userData;
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
    return null;
  }, []);

  // --- NEW: Persistent Check via Cookie ---
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/check-auth.php`, {
          credentials: "include", // Important to send cookies
        });
        const data = await response.json();

        if (data.authenticated) {
          await fetchUserProfile(data.phone);
        } else {
          // Fallback to local if server check fails but session exists
          const savedPhone = localStorage.getItem("userSession");
          if (savedPhone) await fetchUserProfile(savedPhone);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
      setLoading(false);
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
      });

      const data = await response.json(); // Now handling JSON

      if (data.status === "success") {
        localStorage.setItem("userSession", data.phone);
        setOnboardingStep(data.onboarding_step);
        await fetchUserProfile(data.phone);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };
  const isRunningInPWA = () => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://")
    );
  };
  // const logout = () => {
  //   localStorage.removeItem("userSession");

  //   fetch(`${API_BASE_URL}/logout.php`);
  //   setUser(null);
  // };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        // logout,
        isRunningInPWA,
        loading,

        onboardingStep,
        completeStep,
        triggerAndroidInstall,
        hasExpenses,
        setHasExpenses,
        deferredPrompt,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
