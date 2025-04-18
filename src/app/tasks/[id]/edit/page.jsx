"use client";
import { useParams, useRouter } from "next/navigation";
import { useGetTaskByIdQuery, useGetTasksQuery } from "@/app/store/taskSlice";
import TaskForm from "@/app/components/TaskForm";
export default function EditTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    data: task,
    isLoading,
    error,
  } = useGetTaskByIdQuery(id, {
    refetchOnMountOrArgChange: true,
  });

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

  return <TaskForm task={task} />;
}
