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

Located at `server/src/lib/swagger.ts` file swagger specifies authentication string however I decided to split up swagger routes to show auth routes before the other route to be sure authorized users are using swagger

### Getting Your Token

If you go to swagger docs under`/auth/login` endpoint, you can:

1. Login into your profile
2. On success receive a cookie and local storage save
3. you are now have authentication

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
