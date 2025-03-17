"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegisterUserMutation } from "../store/authSlice";
import ProtectedRoute from "../components/protectedRoute";

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
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center h-screen">
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white shadow-lg rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4">Register</h2>
          {error && <p className="text-red-500">{error.data?.message}</p>}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
            required
          />
          <input
            type="text"
            name="tenant_id"
            placeholder="Tenant ID (Leave empty for new tenant)"
            value={formData.tenant_id}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
          />
          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded w-full"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
