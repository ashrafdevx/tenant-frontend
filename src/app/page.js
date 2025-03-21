"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DependencyGraph from "./components/DependencyGraph";
import { useGetTasksQuery } from "./store/taskSlice";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login"); // ✅ Redirect to login if no token
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  const { data: tasks, error, isLoading } = useGetTasksQuery();

  if (!isAuthenticated) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <div className="h-full">
      <div className="">
        <DependencyGraph tasks={tasks} />
      </div>
    </div>
  );
}
