"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, List, ClipboardList } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo / App Name */}
        <Link href="/" className="text-xl font-bold tracking-wide">
          Task Scheduler
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          {user ? (
            <>
              <Link
                href="/tasks"
                className="flex items-center gap-2 hover:text-gray-200"
              >
                <ClipboardList className="w-5 h-5" />
                Tasks
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 hover:text-gray-200"
              >
                <List className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 hover:text-gray-200 disabled:read-only:"
              >
                <User className="w-5 h-5" />
                {user.name}
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
