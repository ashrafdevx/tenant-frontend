"use client";

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.token || null; // ✅ Extract token if available
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
        return null;
      }
    }
  }
  return null;
};
