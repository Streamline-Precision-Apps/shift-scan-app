# MVC Architecture Documentation

## Overview

Your backend follows the **Model-View-Controller (MVC)** pattern, which separates concerns into three distinct layers:

- **Model** (`src/models/`) - Handles database operations using Prisma
- **Service** (`src/services/`) - Contains business logic and data validation
- **Controller** (`src/controllers/`) - Handles HTTP requests/responses and routes

This architecture ensures clean code, maintainability, and easy testing.

---

## Architecture Diagram

```
Request (HTTP)
    ↓
Routes (Express Router)
    ↓
Controller (Request Handler)
    ↓
Service (Business Logic & Validation)
    ↓
Model (Database Operations)
    ↓
Prisma Client
    ↓
PostgreSQL Database
```

---

## 1. Model Layer - Database Operations

### Purpose

The Model layer is responsible for **direct database interactions** using Prisma. It's the only place where database queries should happen.

### Location

`src/models/User.ts`

### Example: UserModel

```typescript
import prisma from "../lib/prisma.js";
import type { User, Prisma } from "../../generated/prisma/index.js";

export class UserModel {
  // GET - Retrieve all users
  static async findAll(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: { startDate: "desc" },
    });
  }

  // GET - Retrieve user by ID
  static async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  // GET - Retrieve user by email
  static async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // GET - Retrieve user by username
  static async findByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { username },
    });
  }

  // CREATE - Insert new user
  static async create(data: Prisma.UserCreateInput): Promise<User> {
    return await prisma.user.create({
      data,
    });
  }

  // UPDATE - Modify existing user
  static async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  // DELETE - Remove user
  static async delete(id: string): Promise<User> {
    return await prisma.user.delete({
      where: { id },
    });
  }
}
```

### Key Principles

1. **No Validation** - Models don't validate data; that's the Service's job
2. **Pure Database Operations** - Only Prisma queries
3. **Static Methods** - Use static class methods for utility functions
4. **Type Safety** - Use Prisma generated types for compile-time type checking

---

## 2. Service Layer - Business Logic & Validation

### Purpose

The Service layer handles:

- **Data Validation** - Ensure data meets requirements
- **Business Logic** - Application-specific rules
- **Error Handling** - Convert database errors to meaningful messages
- **Data Transformation** - Prepare data for responses

### Location

`src/services/UserService.ts`

### Example: UserService

```typescript
import { UserModel } from "../models/User.js";
import type { User, Prisma } from "../../generated/prisma/index.js";

export class UserService {
  // CREATE - With validation
  static async createUser(userData: Prisma.UserCreateInput): Promise<User> {
    // Validation
    if (!userData.firstName) {
      throw new Error("First name is required");
    }
    if (!userData.lastName) {
      throw new Error("Last name is required");
    }
    if (!userData.username) {
      throw new Error("Username is required");
    }
    if (!userData.password) {
      throw new Error("Password is required");
    }
    if (!userData.Company) {
      throw new Error("Company is required");
    }

    // Email format validation
    if (userData.email && typeof userData.email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error("Invalid email format");
      }
    }

    try {
      // Check for duplicates
      if (userData.email) {
        const existingUser = await UserModel.findByEmail(userData.email);
        if (existingUser) {
          throw new Error("User with this email already exists");
        }
      }

      const existingUsername = await UserModel.findByUsername(
        userData.username
      );
      if (existingUsername) {
        throw new Error("Username already exists");
      }

      // Call Model to create user
      return await UserModel.create(userData);
    } catch (error) {
      throw new Error(
        `Failed to create user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // GET - Retrieve user with validation
  static async getUserById(id: string): Promise<User> {
    if (!id) {
      throw new Error("User ID is required");
    }

    try {
      const user = await UserModel.findById(id);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw new Error(
        `Failed to fetch user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // UPDATE - With validation
  static async updateUser(
    id: string,
    userData: Prisma.UserUpdateInput
  ): Promise<User> {
    if (!id) {
      throw new Error("User ID is required");
    }

    // Email validation if provided
    if (userData.email && typeof userData.email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error("Invalid email format");
      }

      // Check if email is already taken
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error("Email is already taken by another user");
      }
    }

    try {
      return await UserModel.update(id, userData);
    } catch (error) {
      throw new Error(
        `Failed to update user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // DELETE - With existence check
  static async deleteUser(id: string): Promise<void> {
    if (!id) {
      throw new Error("User ID is required");
    }

    try {
      // Verify user exists
      await this.getUserById(id);
      // Delete user
      await UserModel.delete(id);
    } catch (error) {
      throw new Error(
        `Failed to delete user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
```

### Key Principles

1. **Validation First** - Validate before calling Model
2. **Error Messages** - Provide clear, meaningful errors
3. **Dependency Injection** - Services use Models
4. **Testable** - Stateless, easy to unit test

---

## 3. Controller Layer - HTTP Handlers

### Purpose

Controllers handle:

- **HTTP Requests** - Extract data from requests
- **Parameter Validation** - Check required params/query params
- **HTTP Responses** - Return appropriate status codes
- **Error Mapping** - Convert errors to HTTP status codes

### Location

`src/controllers/UserController.ts`

### Example: UserController

```typescript
import type { Request, Response } from "express";
import type { User, Prisma } from "../../generated/prisma/index.js";
import { UserService } from "../services/UserService.js";

interface CreateUserRequestBody {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  companyId: string;
  email?: string | null;
  permission?: string;
  // ... other optional fields
}

export class UserController {
  // GET /api/users
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
        message: "Users retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to retrieve users",
      });
    }
  }

  // GET /api/users/:id
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const user = await UserService.getUserById(id);
      res.status(200).json({
        success: true,
        data: user,
        message: "User retrieved successfully",
      });
    } catch (error) {
      // Map error to appropriate HTTP status
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;

      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // POST /api/users
  static async createUser(req: Request, res: Response) {
    try {
      const userData = req.body as CreateUserRequestBody;

      // Transform to Prisma input
      const createData = UserService.createUserWithCompanyId({
        ...userData,
      });

      const newUser = await UserService.createUser(createData);

      res.status(201).json({
        success: true,
        data: newUser,
        message: "User created successfully",
      });
    } catch (error) {
      // Map error to appropriate HTTP status
      const statusCode =
        error instanceof Error && error.message.includes("already exists")
          ? 409 // Conflict
          : 400; // Bad Request

      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // PUT /api/users/:id
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const userData = req.body;
      const updatedUser = await UserService.updateUser(id, userData);

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: "User updated successfully",
      });
    } catch (error) {
      let statusCode = 500;
      if (error instanceof Error) {
        if (error.message.includes("not found")) statusCode = 404;
        else if (error.message.includes("already taken")) statusCode = 409;
        else if (error.message.includes("required")) statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // DELETE /api/users/:id
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      await UserService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;

      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
```

### Key Principles

1. **HTTP Status Codes** - Use correct status codes (200, 201, 400, 404, 409, 500)
2. **Consistent Response Format** - Always return `{ success, data/error, message }`
3. **Error Mapping** - Map business logic errors to HTTP status codes
4. **Thin Controllers** - Delegate logic to Services

---

## 4. Routes - Connecting It All

### Location

`src/routes/userRoutes.ts`

```typescript
import { Router } from "express";
import { UserController } from "../controllers/UserController.js";

const router = Router();

// REST endpoints
router.get("/", UserController.getUsers); // GET /api/users
router.get("/:id", UserController.getUserById); // GET /api/users/:id
router.post("/", UserController.createUser); // POST /api/users
router.put("/:id", UserController.updateUser); // PUT /api/users/:id
router.delete("/:id", UserController.deleteUser); // DELETE /api/users/:id

export default router;
```

---

## How Database Operations Flow

### Example: Creating a User

```
1. HTTP Request
   POST /api/users
   {
     "firstName": "John",
     "lastName": "Doe",
     "username": "johndoe",
     "password": "secure123",
     "companyId": "comp-123",
     "email": "john@example.com"
   }

2. Controller (UserController.createUser)
   - Receives request body
   - Validates required params
   - Calls UserService.createUser()

3. Service (UserService.createUser)
   - Validates firstName, lastName, username, password, companyId
   - Validates email format
   - Checks if email already exists → UserModel.findByEmail()
   - Checks if username already exists → UserModel.findByUsername()
   - Calls UserModel.create()

4. Model (UserModel.create)
   - Calls Prisma: prisma.user.create({ data })

5. Database (PostgreSQL)
   - INSERT INTO "User" VALUES (...)

6. Response
   201 Created
   {
     "success": true,
     "data": {
       "id": "user-456",
       "firstName": "John",
       "lastName": "Doe",
       "username": "johndoe",
       "email": "john@example.com",
       "companyId": "comp-123",
       ...
     },
     "message": "User created successfully"
   }
```

### Example: Retrieving a User

```
1. HTTP Request
   GET /api/users/user-456

2. Controller (UserController.getUserById)
   - Extract id from params
   - Validate id exists
   - Call UserService.getUserById(id)

3. Service (UserService.getUserById)
   - Validate id is provided
   - Call UserModel.findById(id)
   - Check if user exists, throw error if not

4. Model (UserModel.findById)
   - Call Prisma: prisma.user.findUnique({ where: { id } })

5. Database (PostgreSQL)
   - SELECT * FROM "User" WHERE id = 'user-456'

6. Response
   200 OK
   {
     "success": true,
     "data": {
       "id": "user-456",
       "firstName": "John",
       ...
     },
     "message": "User retrieved successfully"
   }
```

### Example: Updating a User

```
1. HTTP Request
   PUT /api/users/user-456
   {
     "firstName": "Jonathan",
     "email": "jonathan@example.com"
   }

2. Controller (UserController.updateUser)
   - Extract id from params
   - Get body data
   - Call UserService.updateUser(id, userData)

3. Service (UserService.updateUser)
   - Validate id is provided
   - Validate email format if provided
   - Check if email is taken by another user
   - Call UserModel.update(id, userData)

4. Model (UserModel.update)
   - Call Prisma: prisma.user.update({ where: { id }, data })

5. Database (PostgreSQL)
   - UPDATE "User" SET firstName = 'Jonathan', email = '...' WHERE id = 'user-456'

6. Response
   200 OK
   {
     "success": true,
     "data": {
       "id": "user-456",
       "firstName": "Jonathan",
       "email": "jonathan@example.com",
       ...
     },
     "message": "User updated successfully"
   }
```

### Example: Deleting a User

```
1. HTTP Request
   DELETE /api/users/user-456

2. Controller (UserController.deleteUser)
   - Extract id from params
   - Call UserService.deleteUser(id)

3. Service (UserService.deleteUser)
   - Validate id is provided
   - Check if user exists → getUserById(id)
   - Call UserModel.delete(id)

4. Model (UserModel.delete)
   - Call Prisma: prisma.user.delete({ where: { id } })

5. Database (PostgreSQL)
   - DELETE FROM "User" WHERE id = 'user-456'

6. Response
   200 OK
   {
     "success": true,
     "message": "User deleted successfully"
   }
```

---

## How to Create a New Route

### Step 1: Add to Model (`src/models/NewEntity.ts`)

```typescript
import prisma from "../lib/prisma.js";
import type { Company, Prisma } from "../../generated/prisma/index.js";

export class CompanyModel {
  static async findAll(): Promise<Company[]> {
    return await prisma.company.findMany();
  }

  static async findById(id: string): Promise<Company | null> {
    return await prisma.company.findUnique({
      where: { id },
    });
  }

  static async create(data: Prisma.CompanyCreateInput): Promise<Company> {
    return await prisma.company.create({ data });
  }

  static async update(
    id: string,
    data: Prisma.CompanyUpdateInput
  ): Promise<Company> {
    return await prisma.company.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string): Promise<Company> {
    return await prisma.company.delete({ where: { id } });
  }
}
```

### Step 2: Add to Service (`src/services/CompanyService.ts`)

```typescript
import { CompanyModel } from "../models/Company.js";
import type { Company, Prisma } from "../../generated/prisma/index.js";

export class CompanyService {
  static async getAllCompanies(): Promise<Company[]> {
    try {
      return await CompanyModel.findAll();
    } catch (error) {
      throw new Error(
        `Failed to fetch companies: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getCompanyById(id: string): Promise<Company> {
    if (!id) {
      throw new Error("Company ID is required");
    }

    try {
      const company = await CompanyModel.findById(id);
      if (!company) {
        throw new Error("Company not found");
      }
      return company;
    } catch (error) {
      throw new Error(
        `Failed to fetch company: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async createCompany(
    data: Prisma.CompanyCreateInput
  ): Promise<Company> {
    if (!data.name) {
      throw new Error("Company name is required");
    }

    try {
      return await CompanyModel.create(data);
    } catch (error) {
      throw new Error(
        `Failed to create company: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async updateCompany(
    id: string,
    data: Prisma.CompanyUpdateInput
  ): Promise<Company> {
    if (!id) {
      throw new Error("Company ID is required");
    }

    try {
      return await CompanyModel.update(id, data);
    } catch (error) {
      throw new Error(
        `Failed to update company: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async deleteCompany(id: string): Promise<void> {
    if (!id) {
      throw new Error("Company ID is required");
    }

    try {
      await this.getCompanyById(id);
      await CompanyModel.delete(id);
    } catch (error) {
      throw new Error(
        `Failed to delete company: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
```

### Step 3: Add to Controller (`src/controllers/CompanyController.ts`)

```typescript
import type { Request, Response } from "express";
import { CompanyService } from "../services/CompanyService.js";

export class CompanyController {
  static async getCompanies(req: Request, res: Response) {
    try {
      const companies = await CompanyService.getAllCompanies();
      res.status(200).json({
        success: true,
        data: companies,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getCompanyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const company = await CompanyService.getCompanyById(id);
      res.status(200).json({
        success: true,
        data: company,
      });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async createCompany(req: Request, res: Response) {
    try {
      const company = await CompanyService.createCompany(req.body);
      res.status(201).json({
        success: true,
        data: company,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async updateCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const company = await CompanyService.updateCompany(id, req.body);
      res.status(200).json({
        success: true,
        data: company,
      });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async deleteCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CompanyService.deleteCompany(id);
      res.status(200).json({
        success: true,
        message: "Company deleted successfully",
      });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message.includes("not found")
          ? 404
          : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
```

### Step 4: Add to Routes (`src/routes/companyRoutes.ts`)

```typescript
import { Router } from "express";
import { CompanyController } from "../controllers/CompanyController.js";

const router = Router();

router.get("/", CompanyController.getCompanies);
router.get("/:id", CompanyController.getCompanyById);
router.post("/", CompanyController.createCompany);
router.put("/:id", CompanyController.updateCompany);
router.delete("/:id", CompanyController.deleteCompany);

export default router;
```

### Step 5: Mount Routes (`src/routes/index.ts`)

```typescript
import { Router } from "express";
import userRoutes from "./userRoutes.js";
import companyRoutes from "./companyRoutes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

router.use("/users", userRoutes);
router.use("/companies", companyRoutes); // Add this line

export default router;
```

---

## Best Practices

### ✅ DO

- **Validate in Services** - All business logic validation happens here
- **Use Type Safety** - Leverage Prisma types and TypeScript
- **Consistent Response Format** - Always use `{ success, data/error, message }`
- **Meaningful Error Messages** - Help clients understand what went wrong
- **Separation of Concerns** - Each layer has one responsibility
- **Error Handling** - Try/catch in all async operations

### ❌ DON'T

- **Don't Query Directly from Controllers** - Always use Models/Services
- **Don't Validate in Models** - That's the Service's job
- **Don't Mix Response Formats** - Keep it consistent
- **Don't Ignore Errors** - Always handle and map them properly
- **Don't Put Business Logic in Controllers** - Move it to Services
- **Don't Use Callbacks** - Use async/await

---

## HTTP Status Codes Reference

| Status | Meaning      | When to Use                        |
| ------ | ------------ | ---------------------------------- |
| 200    | OK           | Successful GET, PUT                |
| 201    | Created      | Successful POST (resource created) |
| 400    | Bad Request  | Invalid input, validation error    |
| 401    | Unauthorized | Authentication required            |
| 403    | Forbidden    | User doesn't have permission       |
| 404    | Not Found    | Resource doesn't exist             |
| 409    | Conflict     | Duplicate email/username           |
| 500    | Server Error | Unexpected server error            |

---

## Summary

Your MVC architecture provides:

- **Clean Code** - Each layer has a single responsibility
- **Maintainability** - Easy to understand and modify
- **Testability** - Each layer can be tested independently
- **Scalability** - Easy to add new models/services/controllers
- **Type Safety** - TypeScript + Prisma types catch errors early

By following this pattern, you ensure consistent, reliable API development!
