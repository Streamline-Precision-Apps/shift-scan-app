# Shift Scan Server

A Node.js + Express + Prisma server with MVC architecture, TypeScript, and PostgreSQL.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment Variables:**
   Make sure your `.env` file contains the DATABASE_URL:

   ```
   DATABASE_URL="your-database-connection-string"
   ```

3. **Generate Prisma Client:**

   ```bash
   npm run db:generate
   ```

4. **Database Operations:**

   ```bash
   # Push schema changes to database (development)
   npm run db:push

   # Create and run migrations (production)
   npm run db:migrate

   # Open Prisma Studio (database GUI)
   npm run db:studio
   ```

## Development

```bash
# Start development server with hot reload
npm run dev
```

## Production

```bash
# Build the project
npm run build

# Start the production server
npm start
```

## Database Schema

The current schema includes example models:

- `User` - Basic user model with email and name
- `Post` - Blog post model with title, content, and author reference

You can modify the schema in `prisma/schema.prisma` and run migrations to update your database.

## Project Structure

```
server/
├── src/
│   ├── index.ts          # Main server entry point
│   └── lib/
│       ├── prisma.ts     # Database client configuration
│       └── config.ts     # Environment configuration
├── prisma/
│   └── schema.prisma     # Database schema
├── generated/
│   └── prisma/           # Generated Prisma client
└── dist/                 # Compiled JavaScript (after build)
```

## Adding Features

1. **API Routes:** Create route handlers in `src/routes/`
2. **Database Models:** Update `prisma/schema.prisma`
3. **Services:** Add business logic in `src/services/`
4. **Middleware:** Add middleware in `src/middleware/`

## Common Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open database GUI
