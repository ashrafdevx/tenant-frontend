"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegisterUserMutation } from "../store/authSlice";

export default function RegisterPage() {
  const router = useRouter();
  const [registerUser, { isLoading, error }] = useRegisterUserMutation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    tenant_id: "", // Add tenant_id for multi-tenancy
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData).unwrap();
      router.push("/login");
    } catch (err) {
      console.error("Registration failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white text-center">
              Create Your Account
            </h2>
            <p className="text-green-100 text-center mt-1">
              Get started with our platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm">{error.data?.message}</p>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="pl-3 pr-10 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-3 pr-10 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pl-3 pr-10 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="tenant_id"
                className="text-sm font-medium text-gray-700"
              >
                Tenant ID
              </label>
              <input
                id="tenant_id"
                type="text"
                name="tenant_id"
                placeholder="Leave empty for new tenant"
                value={formData.tenant_id}
                onChange={handleChange}
                className="pl-3 pr-10 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Enter existing tenant ID or leave blank to create new
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center text-sm text-gray-600 pt-2">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
