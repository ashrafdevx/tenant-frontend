import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// Enhanced schema with dependency validation
export const taskSchema = yupResolver.object().shape({
  title: yup.string().required("Task title is required"),
  description: yup.string().required("Description is required"),
  dueDate: yup
    .date()
    .min(new Date(), "Due date must be in the future")
    .required("Due date is required"),
  assignee: yup.string().required("Assignee is required"),
  status: yup
    .string()
    .oneOf(["pending", "in-progress", "completed"])
    .default("pending"),
  dependencies: yup.array(),
});
