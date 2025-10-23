import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import prisma from "./lib/prisma.js";
import config from "./lib/config.js";
import { swaggerSpec } from "./lib/swagger.js";
import { verifyToken } from "./middleware/authMiddleware.js";
import apiRoutes from "./routes/index.js";
import {
  errorHandler,
  notFoundHandler,
  validateJsonMiddleware,
} from "./middleware/errorMiddleware.js";

async function main() {
  console.log("🚀 Server starting...");

  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Create Express app
    const app = express();

    // Security middleware
    app.use(helmet());

    // CORS middleware
    app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
      })
    );

    // Logging middleware
    app.use(morgan("combined"));

    // Body parsing middleware
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // JSON validation middleware
    app.use(validateJsonMiddleware);

    app.use(
      "/api-docs",
      // require an authenticated user with a valid JWT to view Swagger UI
      verifyToken,
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customCss:
          ".swagger-ui .topbar { display: none } .swagger-ui .info .title { font-size: 2.5em; margin: 20px 0; }",
        customSiteTitle: "Shift Scan API Documentation",
        swaggerOptions: {
          persistAuthorization: true,
          docExpansion: "list",
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
        },
      })
    );

    // Root route
    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Shift Scan Server API",
        version: "1.0.0",
        endpoints: {
          users: "/api/users",
          docs: "/api-docs",
        },
      });
    });

    // API routes
    app.use("/api", apiRoutes);

    // 404 handler
    app.use(notFoundHandler);

    // Error handling middleware (must be last)
    app.use(errorHandler);

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`🌟 Server is running on port ${config.port}`);
      console.log(
        `📖 API documentation available at http://localhost:${config.port}/api-docs`
      );
    });

    // Handle server shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log("✅ Server closed successfully");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main().catch(async (error) => {
  console.error("💥 Server crashed:", error);
  await prisma.$disconnect();
  process.exit(1);
});
