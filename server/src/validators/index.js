const { z } = require("zod");

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["user", "admin"]).optional().default("user"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});

const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().default(""),
    status: z.enum(["pending", "completed"]).optional().default("pending"),
    assignedUser: z.string().optional(),
});

const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(["pending", "completed"]).optional(),
    assignedUser: z.string().optional(),
});

module.exports = { registerSchema, loginSchema, createTaskSchema, updateTaskSchema };
