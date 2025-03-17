"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetTasksQuery } from "@/app/store/taskSlice";
import {
  User,
  ClipboardList,
  CheckCircle,
  Clock,
  Loader2,
  Shield,
} from "lucide-react";
function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const { data: tasks, isLoading, error } = useGetTasksQuery();

  useEffect(() => {
    // Load user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      router.push("/login"); // Redirect if not logged in
    } else {
      setUser(storedUser);
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  // Filter tasks assigned to the current user
  const assignedTasks =
    tasks?.filter((task) => task.assignee === user._id) || [];
  const pendingTasks = assignedTasks.filter(
    (task) => task.status === "pending"
  ).length;
  const inProgressTasks = assignedTasks.filter(
    (task) => task.status === "in-progress"
  ).length;
  const completedTasks = assignedTasks.filter(
    (task) => task.status === "completed"
  ).length;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <User className="w-6 h-6 text-indigo-600" />
        Profile
      </h1>

      <div className="mt-4 border-t pt-4">
        <p className="text-gray-700">
          <strong>Name:</strong> {user.name}
        </p>
        <p className="text-gray-700">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-gray-700 flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-600" />
          <strong>Role:</strong> {user.role}
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          Assigned Tasks
        </h2>
        {isLoading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : error ? (
          <p className="text-red-500">Failed to fetch tasks</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg text-center">
              <Clock className="w-6 h-6 mx-auto" />
              <p className="font-semibold">{pendingTasks}</p>
              <p className="text-sm">Pending</p>
            </div>
            <div className="bg-blue-100 text-blue-700 p-4 rounded-lg text-center">
              <Loader2 className="w-6 h-6 mx-auto animate-spin" />
              <p className="font-semibold">{inProgressTasks}</p>
              <p className="text-sm">In Progress</p>
            </div>
            <div className="bg-green-100 text-green-700 p-4 rounded-lg text-center">
              <CheckCircle className="w-6 h-6 mx-auto" />
              <p className="font-semibold">{completedTasks}</p>
              <p className="text-sm">Completed</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800">Permissions</h2>
        <div className="border p-4 mt-2 rounded-lg bg-gray-100">
          {user.role === "admin" || user.role === "manager" ? (
            <p className="text-green-700">
              ✅ You can create and update tasks.
            </p>
          ) : (
            <p className="text-red-700">
              ❌ You can only view tasks assigned to you.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
