"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetTasksQuery,
  useCheckDependencyCircularityMutation,
} from "../store/taskSlice";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileEdit,
  AlertTriangle,
  X,
  Info,
  Clock,
  Loader2,
  CheckCircle,
  Calendar,
  LinkIcon,
} from "lucide-react";
import { getAuthToken } from "../utils/token";
import { taskSchema } from "../schemas/schemas";

export default function TaskForm({ task }) {
  const router = useRouter();
  const { id } = useParams();
  const {
    data: allTasks,
    isLoading: tasksLoading,
    refetch: TaskRefetch,
  } = useGetTasksQuery();

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [checkCircularity] = useCheckDependencyCircularityMutation();
  const [selectedDeps, setSelectedDeps] = useState(task?.dependencies || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [circularWarning, setCircularWarning] = useState(null);

  const storedUser = getAuthToken();

  const currentUser = storedUser || { role: storedUser?.role };

  // Extract user role with a default fallback
  const userRole = currentUser?.role || "member";

  // Extract tenant_id if available
  const currentTenantId = currentUser?.tenant_id || null;

  // Check if user has permission to create or edit tasks
  const canEditTask =
    userRole === "admin" ||
    userRole === "manager" ||
    (task && task.assignee === currentUser?._id);

  // Filter tasks for dependency selection - can't depend on itself or completed tasks
  const availableDependencyTasks =
    allTasks?.filter((t) => !task || t?._id !== task?._id) || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: task || {
      title: "",
      description: "",
      dueDate: "",
      assignee: "",
      status: "pending",
      dependencies: [],
    },
  });
  useEffect(() => {
    if (task) {
      console.log("task", task);
      setValue("title", task.title);
      setValue("description", task.description);
      setValue("dueDate", new Date(task.dueDate).toISOString().split("T")[0]);
      // setValue("dueDate", task.dueDate.split("T")[0]);
      setValue("assignee", task.assignee);
      setValue("status", task.status || "pending");
      setValue("dependencies", task.dependencies || []);
      setSelectedDeps(task.dependencies || []);
    }
  }, [task, setValue]);

  // Check for circular dependencies when dependencies change
  useEffect(() => {
    const checkForCircularDependencies = async () => {
      if (task && selectedDeps?.length > 0) {
        try {
          const result = await checkCircularity({
            taskId: task?._id,
            dependencies: selectedDeps,
          }).unwrap();

          if (result.hasCircular) {
            setCircularWarning(result.path);
          } else {
            setCircularWarning(null);
          }
        } catch (err) {
          console.error("Error checking dependencies:", err);
        }
      }
    };

    checkForCircularDependencies();
  }, [selectedDeps, task, checkCircularity]);

  // Update when dependencies change
  useEffect(() => {
    setValue("dependencies", selectedDeps);
  }, [selectedDeps, setValue]);

  const onSubmit = async (data) => {
    console.log("OnSubmit", data);
    if (!canEditTask) {
      setNotification({
        show: true,
        message: "You don't have permission to perform this action",
        type: "error",
      });
      return;
    }

    if (circularWarning) {
      setNotification({
        show: true,
        message: "Cannot save with circular dependencies",
        type: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // data.dependencies = selectedDeps;

      // Ensure tenant_id is included
      data.tenant_id = currentTenantId;

      if (task) {
        await updateTask({ id: task?._id, ...data }).unwrap();
        setNotification({
          show: true,
          message: "Task updated successfully!",
          type: "success",
        });
      } else {
        await createTask(data).unwrap();
        setNotification({
          show: true,
          message: "Task created successfully!",
          type: "success",
        });
      }
      router.push("/tasks");

      await TaskRefetch();
      reset({
        title: "",
        description: "",
        dueDate: "",
        assignee: "",
        status: "pending",
        dependencies: [],
      });

      // setTimeout(() => {
      // }, 500);
    } catch (err) {
      console.error("Task operation failed", err);
      setNotification({
        show: true,
        message:
          "Operation failed: " +
          (err.data?.message || err.message || "Unknown error"),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user doesn't have permission to edit, show notification
  useEffect(() => {
    if (!canEditTask && task) {
      setNotification({
        show: true,
        message:
          "You don't have permission to edit this task. Only admins, managers, or the assignee can edit.",
        type: "error",
      });
    }
  }, [canEditTask, task]);

  if (!canEditTask && task) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700">Access Denied</h2>
            <p className="mt-2 text-red-600">
              You don't have permission to edit this task. Only admins,
              managers, or the assignee can edit tasks.
            </p>
            <button
              onClick={() => router.push("/tasks")}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Return to Task List
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          className="flex items-center cursor-pointer text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Task List
        </button>

        {/* User Role Info */}
        <div className="mb-4 flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 rounded-full px-4 py-1 inline-block">
          <Info className="w-4 h-4" />
          <span>
            You are logged in as:{" "}
            <strong>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </strong>
          </span>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div className="flex cursor-pointer items-center">
                <FileEdit className="w-6 h-6 mr-2" />
                <h1 className="text-2xl font-bold">
                  {task
                    ? task?.view
                      ? "View Task"
                      : "Edit Task"
                    : "Create New Task"}
                </h1>
              </div>
              {task && (
                <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  ID: {task?._id?.substring(0, 8)}...
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
                    disabled={isSubmitting}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    {...register("dueDate")}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                  {errors.dueDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.dueDate.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Assignee
                  </label>
                  <input
                    {...register("assignee")}
                    placeholder="Who should complete this task?"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                  {errors.assignee && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.assignee.message}
                    </p>
                  )}
                </div>
                {task && (
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
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    placeholder="Describe the task in detail"
                    rows="5"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isSubmitting}
                  ></textarea>
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description.message}
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

            {/* Form Actions */}
            {!task?.view && (
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push("/tasks")}
                  className="px-4 py-2 border cursor-pointer border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || circularWarning !== null}
                  className={`px-6 py-2 bg-gradient-to-r cursor-pointer from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-70 ${
                    circularWarning !== null ? "cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
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
                      {task ? "Updating..." : "Creating..."}
                    </div>
                  ) : (
                    <>{task ? "Update Task" : "Create Task"}</>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
