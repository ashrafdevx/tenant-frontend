"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useDeleteTaskMutation, useGetTasksQuery } from "../store/taskSlice";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Clock,
  List,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import DependencyGraph from "../components/DependencyGraph";

export default function TaskListPage() {
  const { data: tasks, error, isLoading } = useGetTasksQuery();
  const [deleteTask] = useDeleteTaskMutation();
  const [userRole, setUserRole] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    // Fetch user role from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUserRole(userData.role);
    }

    // Animation effect on page load
    const fadeIn = () => {
      const elements = document.querySelectorAll(".fade-in");
      elements.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add("visible");
        }, i * 100);
      });
    };

    fadeIn();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id).unwrap();
        // Use a more elegant toast notification
        showNotification("Task successfully deleted", "success");
      } catch (err) {
        showNotification("Failed to delete task", "error");
      }
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement("div");
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg text-white ${
      type === "success" ? "bg-emerald-500" : "bg-red-500"
    } z-50 transition-all duration-300 transform translate-y-0 opacity-0`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("opacity-100");
    }, 10);

    setTimeout(() => {
      notification.classList.remove("opacity-100");
      notification.classList.add("opacity-0");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: <Clock className="w-4 h-4 text-amber-500" />,
        };
      case "in-progress":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
        };
      case "completed":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: <MoreHorizontal className="w-4 h-4 text-gray-500" />,
        };
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));

    // Add color coding for due dates
    let dateClass = "";
    if (diffInDays < 0) {
      dateClass = "text-red-600 font-medium";
    } else if (diffInDays < 2) {
      dateClass = "text-amber-600 font-medium";
    } else if (diffInDays < 7) {
      dateClass = "text-blue-600";
    }

    return {
      formatted: new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      className: dateClass,
    };
  };

  // Calculate progress percentage for each task
  const calculateProgress = (task) => {
    // A simple implementation - you might want to add more sophisticated logic
    switch (task?.status) {
      case "pending":
        return 0;
      case "in-progress":
        return 50;
      case "completed":
        return 100;
      default:
        return 0;
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-red-600 font-semibold text-xl mb-2">
            Error Loading Tasks
          </p>
          <p className="text-gray-700">
            Please try refreshing the page or contact support.
          </p>
        </div>
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-indigo-500 via-blue-200 to-blue-500 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className=" w-full transition-all duration-500 ease-in-out transform translate-y-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-indigo-900 mb-2">
                Task Dashboard
              </h1>
              <p className="text-gray-600 font-light">
                Manage and visualize your team's workflow efficiently.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                className={`px-3 py-2 cursor-pointer rounded-md ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-indigo-600 border border-indigo-200"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    ></path>
                  </svg>
                  Grid
                </div>
              </button>
              <button
                className={`px-3 py-2 cursor-pointer rounded-md ${
                  viewMode === "list"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-indigo-600 border border-indigo-200"
                }`}
                onClick={() => setViewMode("list")}
              >
                <div className="flex items-center">
                  <List className="w-5 h-5 mr-1" />
                  List
                </div>
              </button>
              <Link href="/tasks/create">
                <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center">
                  <Plus className="w-5 h-5 mr-1" />
                  Create Task
                </button>
              </Link>
            </div>
          </div>
        </div>
        {/* Dashboard Overview */}

        <div className="transition-all duration-500 ease-in-out transform translate-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {tasks?.filter((t) => t.status === "pending").length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Loader2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm font-medium">
                    In Progress
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {tasks?.filter((t) => t.status === "in-progress").length ||
                      0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Completed
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {tasks?.filter((t) => t.status === "completed").length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Task List */}
        <div className=" transition-all duration-500 ease-in-out transform translate-y-4">
          {tasks?.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map((task, index) => {
                    const statusStyles = getStatusColor(task?.status);
                    const dueDate = formatDate(task?.dueDate);
                    const progress = calculateProgress(task);

                    return (
                      <div
                        key={task?._id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100"
                      >
                        <div className="p-6">
                          {/* Task Title */}
                          <div className="flex justify-between items-start mb-3">
                            <h2 className="text-xl font-semibold text-gray-800 leading-tight">
                              {task?.title}
                            </h2>
                            <div
                              className={`${statusStyles.bg} ${statusStyles.text} ${statusStyles.border} px-3 py-1 rounded-full text-xs font-medium flex items-center border`}
                            >
                              {statusStyles.icon}
                              <span className="ml-1 capitalize">
                                {task?.status}
                              </span>
                            </div>
                          </div>

                          {/* Task Description */}
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {task?.description}
                          </p>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>

                          {/* Due Date*/}
                          <div className="flex items-center mb-4">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className={`text-sm ${dueDate.className}`}>
                              Due: {dueDate.formatted}
                            </span>
                          </div>

                          {/* Dependencies */}
                          {task?.dependencies?.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                                Dependencies
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {task?.dependencies
                                  .slice(0, 2)
                                  .map((dep, idx) => (
                                    <span
                                      key={dep?._id || idx}
                                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                                    >
                                      {dep?.title || `Task ${idx + 1}`}
                                    </span>
                                  ))}
                                {task?.dependencies.length > 2 && (
                                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    +{task?.dependencies.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex space-x-2">
                              <Link href={`/tasks/${task?._id}`}>
                                <button className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                                  <ArrowRight className="w-4 h-4 mr-1" />
                                  View
                                </button>
                              </Link>
                              <Link href={`/tasks/${task?._id}/edit`}>
                                <button className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                                  <ArrowUpRight className="w-4 h-4 mr-1" />
                                  Edit
                                </button>
                              </Link>
                            </div>

                            {/* Show Delete Button Only for Admins */}
                            {userRole === "admin" && (
                              <button
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-colors"
                                onClick={() => handleDelete(task?._id)}
                                title="Delete Task"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Task
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Due Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Dependencies
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tasks.map((task) => {
                        const statusStyles = getStatusColor(task?.status);
                        const dueDate = formatDate(task?.dueDate);

                        return (
                          <tr key={task?._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {task?.title}
                                  </div>
                                  <div className="text-sm text-gray-500 line-clamp-1">
                                    {task?.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`${statusStyles.bg} ${statusStyles.text} ${statusStyles.border} px-3 py-1 rounded-full text-xs font-medium inline-flex items-center border`}
                              >
                                {statusStyles.icon}
                                <span className="ml-1 capitalize">
                                  {task?.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm ${dueDate.className}`}>
                                {dueDate.formatted}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {task?.dependencies?.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {task?.dependencies
                                    .slice(0, 2)
                                    .map((dep, idx) => (
                                      <span
                                        key={dep._id || idx}
                                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                                      >
                                        {dep?.title || `Task ${idx + 1}`}
                                      </span>
                                    ))}
                                  {task?.dependencies.length > 2 && (
                                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                      +{task?.dependencies.length - 2} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  None
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link href={`/tasks/${task?._id}`}>
                                  <button className="bg-indigo-50 cursor-pointer text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded-md text-xs font-medium">
                                    View
                                  </button>
                                </Link>
                                <Link href={`/tasks/${task?._id}/edit`}>
                                  <button className="bg-blue-50 cursor-pointer text-blue-700 hover:bg-blue-100 px-2 py-1 rounded-md text-xs font-medium">
                                    Edit
                                  </button>
                                </Link>

                                {/* Show Delete Button Only for Admins*/}
                                {userRole === "admin" && (
                                  <button
                                    className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 p-1 rounded-md transition-colors"
                                    onClick={() => handleDelete(task?._id)}
                                    title="Delete Task"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="bg-indigo-50 p-4 rounded-full mb-4">
                  <List className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  No Tasks Available
                </h3>
                <p className="text-gray-600 max-w-md mb-6">
                  Get started by creating your first task to keep track of your
                  projects and deadlines.
                </p>
                <Link href="/tasks/create">
                  <button className="bg-gradient-to-r cursor-pointer from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Task
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        .fade-in {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
