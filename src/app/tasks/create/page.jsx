"use client";
import TaskForm from "@/app/components/TaskForm";
import { useGetByIdTasksQuery } from "@/app/store/taskSlice";

export default function EditTaskPage({ params }) {
  return <TaskForm />;
}
