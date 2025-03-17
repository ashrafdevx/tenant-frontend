"use client";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { useLoginUserMutation } from "../store/authSlice";
import ProtectedRoute from "../components/protectedRoute";

export default function LoginPage() {
  const router = useRouter();
  const [loginUser, { isLoading, error }] = useLoginUserMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password }).unwrap();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // Store user details including role
      router.push("/tasks");
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("user");
    console.log("token", token);
    if (token) {
      router.push("/tasks"); // Redirect if already logged in
    }
  }, [router]);
  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center h-screen">
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white shadow-lg rounded-lg"
        >
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          {error && <p className="text-red-500">{error.data?.message}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full mb-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full mb-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded w-full"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}

// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useLoginUserMutation } from "../store/authSlice";

// export default function LoginPage() {
//   const router = useRouter();
//   const [loginUser, { isLoading, error }] = useLoginUserMutation();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const data = await loginUser({ email, password }).unwrap();
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));
//       router.push("/");
//     } catch (err) {
//       console.error("Login failed", err);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen">
//       <form
//         onSubmit={handleSubmit}
//         className="p-6 bg-white shadow-lg rounded-lg"
//       >
//         <h2 className="text-2xl font-bold mb-4">Login</h2>
//         {error && <p className="text-red-500">{error.data?.message}</p>}
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="border p-2 w-full mb-2"
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="border p-2 w-full mb-2"
//           required
//         />
//         <button
//           type="submit"
//           className="bg-blue-500 text-white p-2 rounded w-full"
//           disabled={isLoading}
//         >
//           {isLoading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//     </div>
//   );
// }
