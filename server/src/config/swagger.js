const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "TaskFlow API",
            version: "1.0.0",
            description: "Production-grade REST API with JWT Auth, RBAC, and Task Management",
        },
        servers: [
            {
                url: "http://localhost:5000",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
                        role: { type: "string", enum: ["user", "admin"] },
                    },
                },
                Task: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        status: { type: "string", enum: ["pending", "completed"] },
                        assignedUser: { type: "string" },
                    },
                },
                RegisterInput: {
                    type: "object",
                    required: ["name", "email", "password"],
                    properties: {
                        name: { type: "string", minLength: 2 },
                        email: { type: "string", format: "email" },
                        password: { type: "string", minLength: 6 },
                        role: { type: "string", enum: ["user", "admin"] },
                    },
                },
                LoginInput: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email" },
                        password: { type: "string" },
                    },
                },
                TaskInput: {
                    type: "object",
                    required: ["title"],
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        status: { type: "string", enum: ["pending", "completed"] },
                        assignedUser: { type: "string" },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
