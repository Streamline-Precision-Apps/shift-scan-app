// Error handling middleware

!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="147fabb7-8f0e-5ae5-abee-aa258a20b24c")}catch(e){}}();
export function routeErrorHandler(error, message) {
    if (message) {
        console.error(message);
    }
    if (error instanceof Error) {
        console.error(error.stack || error.message);
    }
    else {
        console.error(error);
    }
}
export function errorHandler(err, req, res, next) {
    // Log error
    if (err instanceof Error) {
        console.error(err.stack || err.message);
    }
    else {
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
export const notFoundHandler = (req, res) => {
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
export const validateJsonMiddleware = (error, req, res, next) => {
    if (error instanceof SyntaxError && "body" in error) {
        return res.status(400).json({
            success: false,
            error: "Invalid JSON in request body",
            message: "Please check your request body format",
        });
    }
    next(error);
};
//# sourceMappingURL=errorMiddleware.js.map
//# debugId=147fabb7-8f0e-5ae5-abee-aa258a20b24c
