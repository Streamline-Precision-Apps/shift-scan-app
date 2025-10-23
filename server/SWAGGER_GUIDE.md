# Swagger Documentation Guide

## Installation Complete! ✅

You've successfully installed Swagger with the following packages:
- `swagger-jsdoc` - Parses JSDoc comments and generates OpenAPI specification
- `swagger-ui-express` - Serves interactive Swagger UI

## Accessing the Documentation

Once your server is running (`npm run dev`), visit:
```
http://localhost:[PORT]/api-docs
```

## How to Document Your Endpoints

Add JSDoc comments to your route files to automatically generate API documentation. Here's an example:

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *       401:
 *         description: Unauthorized - No valid token provided
 *       500:
 *         description: Server error
 */
router.get("/", getUsersController);
```

## Parameter Documentation Examples

### Query Parameters
```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 */
```

### Path Parameters
```typescript
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 */
```

### Request Body
```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
```

## Authentication

### Option 1: Use Environment Variable (Recommended for Development)

1. Add your JWT token to your `.env` file:
```env
SWAGGER_BEARER_TOKEN="your_jwt_token_here"
```

2. Restart your dev server (`npm run dev`)

3. The token will be available via the `/api/swagger-token` endpoint

4. To authorize in Swagger UI:
   - Visit `http://localhost:[PORT]/api-docs`
   - Click the "Authorize" button
   - Get your token by visiting `http://localhost:[PORT]/api/swagger-token`
   - Paste it in the value field as: `Bearer your_token_here`
   - Click "Authorize"

### Option 2: Manual Authorization

1. Click the "Authorize" button in the Swagger UI
2. Enter your JWT token in the format: `Bearer YOUR_JWT_TOKEN`
3. Click "Authorize"
4. Click "Close"

### Getting Your Token

If you have a `/api/auth/login` endpoint, you can:
1. Test it in Swagger (without authorization required)
2. Copy the token from the response
3. Use that token to authorize other endpoints

### How Bearer Authentication Works

The Bearer token is added to request headers as:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

This header is automatically included with all requests to authenticated endpoints.

## Tips

- JSDoc comments must start with `/**` and contain `@swagger`
- Changes to JSDoc comments require restarting the dev server
- Keep your documentation close to your code for easier maintenance
- Use descriptive tags to organize endpoints (e.g., Users, Posts, Comments)
- Always document error responses (400, 401, 404, 500, etc.)

## Common Response Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Authorization failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
