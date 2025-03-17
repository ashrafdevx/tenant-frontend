"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useGetTaskByIdQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from "@/app/store/taskSlice";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileEdit,
  Loader2,
  Save,
  User,
  X,
  ArrowLeft,
  Link as LinkIcon,
} from "lucide-react";

const taskSchema = yup.object().shape({
  title: yup.string().required("Task title is required"),
  description: yup.string().required("Description is required"),
  status: yup
    .string()
    .oneOf(["pending", "in-progress", "completed"], "Invalid status"),
  dueDate: yup
    .date()
    .min(new Date(), "Due date must be in the future")
    .required("Due date is required"),
  assignee: yup.string().required("Assignee is required"),
  dependencies: yup.array().of(yup.string()),
});

export default function EditTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: task, isLoading, error } = useGetTaskByIdQuery(id);
  const { data: allTasks } = useGetTasksQuery();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      dueDate: "",
      assignee: "",
      dependencies: [],
    },
  });

  useEffect(() => {
    if (task) {
      setValue("title", task.title);
      setValue("description", task.description);
      setValue("status", task.status);
      setValue("dueDate", task.dueDate.split("T")[0]);
      setValue("assignee", task.assignee);
      setValue(
        "dependencies",
        task.dependencies.map((dep) => dep._id)
      );
    }
  }, [task, setValue]);

  const onSubmit = async (data) => {
    try {
      await updateTask({ id, ...data }).unwrap();
      showNotification("Task updated successfully!", "success");
      setTimeout(() => {
        router.push("/tasks");
      }, 1500);
    } catch (err) {
      showNotification("Failed to update task", "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "in-progress":
        return <Loader2 className="w-5 h-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-red-600 font-semibold text-xl mb-2">
            Error Loading Task
          </p>
          <p className="text-gray-700">
            Please try refreshing the page or contact support.
          </p>
          <button
            onClick={() => router.push("/tasks")}
            className="mt-4 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            Return to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Notification */}
        {notification.show && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 border ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <p>{notification.message}</p>
              <button
                onClick={() =>
                  setNotification({ show: false, message: "", type: "" })
                }
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.push("/tasks")}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Task List
        </button>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FileEdit className="w-6 h-6 mr-2" />
                <h1 className="text-2xl font-bold">Edit Task</h1>
              </div>
              {task && (
                <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  ID: {id.substring(0, 8)}...
                </div>
              )}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Task Title
                  </label>
                  <input
                    {...register("title")}
                    placeholder="Enter task title"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.title?.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    placeholder="Enter task description"
                    rows={5}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  ></textarea>
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description?.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Assignee
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register("assignee")}
                      placeholder="Assignee ID or Name"
                      className="border border-gray-300 rounded-lg p-3 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  {errors.assignee && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.assignee?.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getStatusIcon(watch("status"))}
                    </div>
                    <select
                      {...register("status")}
                      className="border border-gray-300 rounded-lg p-3 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.status && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.status?.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      {...register("dueDate")}
                      className="border border-gray-300 rounded-lg p-3 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  {errors.dueDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.dueDate?.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                    <LinkIcon className="w-4 h-4 mr-1" />
                    Dependencies
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {allTasks?.length > 0 ? (
                      allTasks
                        .filter((t) => t._id !== id) // Filter out current task
                        .map((t) => (
                          <div
                            key={t._id}
                            className="flex items-center py-1 hover:bg-gray-50 px-2 rounded"
                          >
                            <input
                              type="checkbox"
                              id={`dep-${t._id}`}
                              {...register("dependencies")}
                              value={t._id}
                              defaultChecked={watch("dependencies")?.includes(
                                t._id
                              )}
                              className="mr-2 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label
                              htmlFor={`dep-${t._id}`}
                              className="text-sm text-gray-700 cursor-pointer flex-grow"
                            >
                              {t.title}
                            </label>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                t.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : t.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500 text-sm py-2">
                        No other tasks available to select as dependencies.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3 border-t pt-6">
              <button
                type="button"
                onClick={() => router.push("/tasks")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || !isDirty}
                className={`flex items-center px-6 py-2 rounded-lg text-white ${
                  isDirty
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                    : "bg-gray-400"
                }`}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5 mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Update Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Task History Card */}
        {task && (
          <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Task History
              </h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Created by Admin
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Initial Status</p>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                    Pending
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                    <FileEdit className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Last Updated
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(task.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Current Status</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      task.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : task.status === "in-progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
