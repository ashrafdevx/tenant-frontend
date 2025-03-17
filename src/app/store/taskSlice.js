import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + "/api/tasks",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Fetch all tasks
    getTasks: builder.query({
      query: () => "/",
    }),

    // Fetch a specific task by ID
    getTaskById: builder.query({
      query: (id) => `/${id}`,
    }),

    // Create a new task
    createTask: builder.mutation({
      query: (taskData) => ({
        url: "/",
        method: "POST",
        body: taskData,
      }),
    }),

    // Update an existing task
    updateTask: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: updatedData,
      }),
    }),

    // Delete a task
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
    }),

    // Add a dependency to a task
    addDependency: builder.mutation({
      query: ({ id, dependent_task_id }) => ({
        url: `/${id}/dependencies`,
        method: "POST",
        body: { dependent_task_id },
      }),
    }),

    // Get dependencies for a specific task
    getDependencies: builder.query({
      query: (id) => `/${id}/dependencies`,
    }),

    // Remove a dependency from a task
    removeDependency: builder.mutation({
      query: ({ id, dependencyId }) => ({
        url: `/${id}/dependencies/${dependencyId}`,
        method: "DELETE",
      }),
    }),

    // Add this to your taskApi endpoints in task slice.jsx
    checkDependencyCircularity: builder.mutation({
      query: ({ taskId, dependencies }) => ({
        url: `/${taskId}/check-dependencies`,
        method: "POST",
        body: { dependencies },
      }),
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAddDependencyMutation,
  useGetDependenciesQuery,
  useRemoveDependencyMutation,
  useCheckDependencyCircularityMutation,
} = taskApi;
