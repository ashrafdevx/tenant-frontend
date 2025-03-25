"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useGetTaskByIdQuery } from "@/app/store/taskSlice";
import TaskForm from "@/app/components/TaskForm";
import Spinner from "@/app/components/Spinner";

export default function TaskDetails({ params }) {
  const { data: task, error, isLoading } = useGetTaskByIdQuery(params.id);

  if (isLoading) return <Spinner />;
  if (error || !task) return notFound();

  return <TaskForm task={{ ...task, view: true }} />;
}
