import swaggerJsdoc from "swagger-jsdoc";
import config from "./config.js";

// Security schemes definition
const SECURITY_SCHEMES = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description:
      "Enter your bearer token to authorize access to protected routes",
  },
} as const;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shift Scan API",
      version: "1.0.0",
      description: "API documentation for Shift Scan application",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Development server",
      },
      {
        url: `${process.env.PRODUCTION_URL || "https://api.example.com"}`,
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: SECURITY_SCHEMES,
    },
  },
  apis: ["./src/routes/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options as any);
