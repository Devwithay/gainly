import React, { createContext, useState, useEffect, useCallback } from "react";
import API_BASE_URL from "../apiConfig";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 const fetchUserProfile = useCallback(async (phone) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/fetch-profile.php?phone=${phone}`,
    );
    const data = await response.json();

    if (!data.error) {
      
      let userNiches = [];
      try {
        userNiches = data.categories ? JSON.parse(data.categories) : (data.category ? [data.category] : []);
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
      return userData;
    }
  } catch (err) {
    console.error("Failed to fetch profile", err);
  }
  return null;
}, []);

  const updateUser = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const savedPhone = localStorage.getItem("userSession");
      if (savedPhone) {
        await fetchUserProfile(savedPhone);
      }
      setLoading(false);
    };
    initializeAuth();
  }, [fetchUserProfile]);

  const register = async (fname, bname, category, phone, pass) => {
    const formData = new FormData();
    formData.append("fname", fname);
    formData.append("bname", bname);
   
    formData.append("categories", category); 
    formData.append("phone", phone);
    formData.append("pass", pass);

    try {
      const response = await fetch(`${API_BASE_URL}/create-vendor.php`, {
        method: "POST",
        body: formData,
      });
      return await response.text();
    } catch (error) {
      return "connection_error";
    }
};

  const login = async (phone, password) => {
    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("password", password);

    try {
      const response = await fetch(`${API_BASE_URL}/verify-vendor.php`, {
        method: "POST",
        body: formData,
      });

      const result = await response.text();
      const trimmedPhone = result.trim();

      if (result && trimmedPhone.length >= 10 && !result.includes("<br")) {
        localStorage.setItem("userSession", trimmedPhone);

        await fetchUserProfile(trimmedPhone);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("userSession");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
