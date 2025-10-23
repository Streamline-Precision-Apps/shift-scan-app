# MVC Architecture: Layered Breakdown for Node/Express + Prisma

### Rule of thumb when executing middleware

/
Request - (Fetch/ axios from client)
|
Global Middleware (/src/index.ts)
|
Route Middleware, Validators, Authentication (/src/routes)
|
Controller (src/controllers)
->
Service (src/services)
->  
Prisma Modal Layer (src/models)
|
Error Handler (if needed) (/src/index.ts)
|
Response - Sent back from server to client
\

## 🧱 Layer Breakdown

### 1. Model (Prisma Schema + Data Access)

- Represents database tables and handles data persistence.
- Defined in `prisma/schema.prisma`.
- Prisma generates a typed client that we use to query or update data.
- Models should **not** contain business logic — only structure and access.

**Example:**

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

**Data access (optional helper file):**

```ts
// models/userModel.ts
import prisma from "@/lib/prisma";

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUser = (data: any) => {
  return prisma.user.create({ data });
};
```

---

### 2. Service Layer

- The brains of the application — contains business logic.
- Interacts with Prisma (or model helpers) and applies validation, security, and workflows.
- Returns clean data for the controller to respond with.
- Does **not** handle HTTP or Express-specific logic (e.g., `req`, `res`).

**Example:**

```ts
// services/userService.ts
import { findUserByEmail, createUser } from "@/models/userModel";
import bcrypt from "bcryptjs";

export const registerUser = async (userData: any) => {
  const { name, email, password } = userData;

  const existing = await findUserByEmail(email);
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);

  return await createUser({
    name,
    email,
    password: hashedPassword,
  });
};
```

---

### 3. Controller

- Handles incoming HTTP requests and outgoing responses.
- Validates the input (basic checks) and delegates the main work to the Service Layer.
- Converts service results into proper HTTP responses.

**Example:**

```ts
// controllers/userController.ts
import * as userService from "@/services/userService";

export const registerUser = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
```

---

### 4. Routes

- Connects Express routes to controller functions.
- Keeps routing logic separate from request handling.
- Middleware runs before the Controller, while Error-handling middleware runs after it.

**Example:**

```ts
// routes/userRoutes.ts
import { Router } from "express";
import { registerUser } from "@/controllers/userController";

const router = Router();

router.post("/register", registerUser);

export default router;
```

---

## Summary

- **Model:** Defines data structure and access (no business logic).
- **Service:** Contains business logic, validation, and workflows.
- **Controller:** Handles HTTP, delegates to service, formats responses.
- **Routes:** Connects Express endpoints to controllers.

This separation keeps your codebase clean, testable, and maintainable.
