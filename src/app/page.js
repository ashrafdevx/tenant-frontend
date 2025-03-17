"use client";
import DependencyGraph from "./components/DependencyGraph";
import { useGetTasksQuery } from "./store/taskSlice";

export default function Home() {
  const { data: tasks, error, isLoading } = useGetTasksQuery();
  console.log(tasks);
  return (
    <div className="h-full">
      <div className="">
        <DependencyGraph tasks={tasks} />
      </div>
    </div>
  );
}
