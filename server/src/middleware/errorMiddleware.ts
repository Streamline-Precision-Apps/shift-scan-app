import type { Request, Response, NextFunction } from "express";

// Error handling middleware
export function routeErrorHandler(error: unknown, message?: string): void {
  if (message) {
    console.error(message);
  }
  if (error instanceof Error) {
    console.error(error.stack || error.message);
  } else {
    console.error(error);
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  if (err instanceof Error) {
    console.error(err.stack || err.message);
  } else {
    console.error(err);
  }
  // Respond with error
  res.status(500).json({
    success: false,
    error: err instanceof Error ? err.message : String(err),
    message: "Internal server error",
  });
}

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `Cannot ${req.method} ${req.path}`,
    availableRoutes: {
      users: {
        "GET /api/users": "Get all users",
        "GET /api/users/:id": "Get user by ID",
        "POST /api/users": "Create new user",
        "PUT /api/users/:id": "Update user",
        "DELETE /api/users/:id": "Delete user",
      },
      posts: {
        "GET /api/posts": "Get all posts",
        "GET /api/posts/:id": "Get post by ID",
        "GET /api/posts/author/:authorId": "Get posts by author",
        "POST /api/posts": "Create new post",
        "PUT /api/posts/:id": "Update post",
        "DELETE /api/posts/:id": "Delete post",
        "PATCH /api/posts/:id/toggle-published": "Toggle post published status",
      },
    },
  });
};

// Request validation middleware
export const validateJsonMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON in request body",
      message: "Please check your request body format",
    });
  }
  next(error);
};
