// Error handling middleware
export const errorHandler = (error, req, res, next) => {
    console.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
        success: false,
        error: isDevelopment ? error.message : 'Internal server error',
        message: 'Something went wrong',
        ...(isDevelopment && { stack: error.stack })
    });
};
// 404 handler
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.path}`,
        availableRoutes: {
            users: {
                'GET /api/users': 'Get all users',
                'GET /api/users/:id': 'Get user by ID',
                'POST /api/users': 'Create new user',
                'PUT /api/users/:id': 'Update user',
                'DELETE /api/users/:id': 'Delete user'
            },
            posts: {
                'GET /api/posts': 'Get all posts',
                'GET /api/posts/:id': 'Get post by ID',
                'GET /api/posts/author/:authorId': 'Get posts by author',
                'POST /api/posts': 'Create new post',
                'PUT /api/posts/:id': 'Update post',
                'DELETE /api/posts/:id': 'Delete post',
                'PATCH /api/posts/:id/toggle-published': 'Toggle post published status'
            }
        }
    });
};
// Request validation middleware
export const validateJsonMiddleware = (error, req, res, next) => {
    if (error instanceof SyntaxError && 'body' in error) {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON in request body',
            message: 'Please check your request body format'
        });
    }
    next(error);
};
//# sourceMappingURL=errorMiddleware.js.map