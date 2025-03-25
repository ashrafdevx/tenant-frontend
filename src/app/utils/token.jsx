"use client";

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    console.log("storedUser", storedUser);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user || null; // ✅ Extract token if available
    }
  }
  return null;
};
