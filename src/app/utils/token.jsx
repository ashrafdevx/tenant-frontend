"use client";

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user || null; // ✅ Extract token if available
    }
  }
  return null;
};
