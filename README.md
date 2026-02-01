# NestJS - Backend Journey

A professional, scalable backend for React Native applications built with NestJS. This repository documents the journey from a basic "Hello World" to a high-performance video streaming backend.

## 📅 Day 1: Architecture & Foundation

**Goal:** Master the "NestJS Way" (Modules, Controllers, Services), build a robust standardized REST API, and implement solid validation and error handling without a database.

### 🚀 Key Achievements

- **Architecture Setup:** Scaffolded a modular monolithic structure using the Nest CLI.
- **CRUD Implementation:** Built a fully functional `Tasks` resource with Create, Read, Update, Delete operations using in-memory storage.
- **Dependency Injection (DI):** Mastered how Modules, Controllers, and Services wire together automatically.
- **Strict Validation:** Implemented DTOs (Data Transfer Objects) with `class-validator` to protect the API from bad data.
- **UUIDs:** Switched from numeric IDs to UUIDs (Strings) for better security and distributed system compatibility.
- **Standardized Responses:**
  - **Success:** Automatically wraps all data in a `{ success: true, data: ... }` envelope using a global **Interceptor**.
  - **Errors:** Automatically catches all exceptions and formats them into a `{ success: false, error: ... }` structure using a global **Filter**.
- **Logging:** Implemented a custom Logging Interceptor to benchmark request duration.
- **Configuration:** Set up `@nestjs/config` for environment variables and enabled CORS.

---

### 🛠️ Tech Stack & Dependencies

- **Runtime:** Node.js
- **Framework:** NestJS
- **Language:** TypeScript

#### Core Libraries Explained

- **`@nestjs/common`**: Contains the decorators you will use every day (`@Controller`, `@Get`, `@Module`, `@Injectable`). It's the "syntax" of Nest.
- **`@nestjs/core`**: The internal runtime that handles Dependency Injection (DI) and lifecycle hooks. It’s the "brain."
- **`@nestjs/platform-express`**:
  - _Crucial Concept:_ NestJS is an abstraction layer. It doesn't handle HTTP requests itself; it hands them off to a lower-level HTTP server. By default, it uses Express.
  - _React Native Analogy:_ Just as React Native wraps iOS/Android UI components, NestJS wraps Express (or Fastify). You write Nest code, and it translates that into Express handlers under the hood.
- **`reflect-metadata`**: The "Magic Glue."
  - TypeScript normally erases types when it compiles to JS. This library allows NestJS to "see" your types at runtime.
  - _Example:_ When you write `constructor(private service: TaskService)`, this library tells Nest: "Hey, he wants an instance of TaskService here." Without this, Dependency Injection breaks.
- **`rxjs`**: A library for reactive programming (Streams). Nest uses this heavily for handling asynchronous flows, especially in Interceptors and Microservices.

#### Utilities

- **`class-validator` & `class-transformer`**: Decorator-based validation for DTOs (e.g., `@IsString()`, `@IsNotEmpty()`).
- **`@nestjs/config`**: Manages environment variables (`.env`) safely.
- **`uuid`**: Generates unique string identifiers for resources.

---

### 📂 Key Project Structure

```text
src/
├── common/                     # Shared logic (The "Glue")
│   ├── filters/
│   │   └── http-exception.filter.ts  # Standardizes Error Responses (400, 404, 500)
│   ├── helpers/
│   │   └── api-response.helper.ts    # Single Source of Truth for JSON structure
│   └── interceptors/
│       ├── logging.interceptor.ts    # Logs request duration (Benchmarking)
│       └── transform.interceptor.ts  # Wraps Success Responses (200 OK)
├── tasks/                      # 'Tasks' Feature Module
│   ├── dto/                    # Data Transfer Objects (Input Validation)
│   ├── entities/               # Data Models
│   ├── tasks.controller.ts     # Handles HTTP Requests (Routing)
│   ├── tasks.module.ts         # Bundles the feature
│   ├── tasks.service.ts        # Business Logic (CRUD)
│   └── tasks.controller.spec.ts # Unit Tests
├── app.module.ts               # Root Module (Config & Imports)
└── main.ts                     # Entry Point (Global Pipes, CORS, App Start)
```

### 🧠 Concepts Mastered

1.  **Request Lifecycle:**
    - `Request` ➔ `Middleware` ➔ `Guards` ➔ `Interceptors (Pre)` ➔ `Pipes (Validation)` ➔ **Controller** ➔ **Service** ➔ `Interceptors (Post)` ➔ `Exception Filters` ➔ `Response`
2.  **DTOs (Data Transfer Objects):**
    - Defining the exact shape of data expected from the frontend to prevent pollution and ensure type safety.
3.  **Global Pipes:**
    - Using `ValidationPipe` globally to automatically reject invalid requests with `400 Bad Request` before they reach the controller.
4.  **Separation of Concerns:**
    - **Controllers** only handle routing and HTTP.
    - **Services** only handle logic and data.
    - **Interceptors/Filters** only handle response formatting.

---

## 📅 Day 2: Advanced Database & Relational Modeling

**Goal:** Transition from in-memory storage to a production-grade Relational Database (PostgreSQL). Master TypeORM for complex data relationships, implement ACID Transactions for data integrity, handle File Uploads with cloud storage (Supabase), and optimize for Performance (Indexing & Denormalization).

### 🚀 Key Achievements

- **Database Integration:** Successfully connected NestJS to a PostgreSQL database hosted on Supabase via Docker/Cloud.
- **Relational Modeling (The 5-Table Schema):** Designed and implemented a complex social graph:
  - **One-to-Many (1:N):** User ↔ Posts, User ↔ Comments.
  - **Many-to-Many (M:N):** Posts ↔ Tags (using a hidden Pivot Table).
  - **Unique Constraints:** Implemented "One Like per User per Post" enforcement at the database level.
- **ACID Transactions:** Implemented manual transaction management using QueryRunner to ensure atomicity (e.g., creating a post and updating user stats simultaneously).
- **Saga Pattern (Error Compensation):** Built a "Rollback" mechanism for File Uploads. If the Database insert fails, the file is automatically deleted from Cloud Storage to prevent "Ghost Files."
- **Performance Optimization:**
  - **Indexing:** Applied `@Index()` on frequently searched columns (userId, title) to enforce O(log n) search speeds.
  - **Denormalization:** Added `postsCount` and `likeCount` columns to avoid expensive `COUNT(*)` queries during reads.
  - **N+1 Problem Solved:** Used Eager Loading (relations) and QueryBuilder to fetch deep nested data in a single SQL query.
- **File Uploads:** Handled multipart/form-data uploads with strict validation (File Type & Size) and uploaded them to Supabase Storage.

### 🛠️ Tech Stack & Dependencies

- **Database:** PostgreSQL (via Supabase)
- **ORM:** TypeORM
- **Storage:** Supabase Storage (S3-compatible)

#### Core Libraries Explained

- **`@nestjs/typeorm` & `typeorm`:** The Object-Relational Mapper (ORM). It bridges the gap between TypeScript Classes (Entities) and SQL Tables. It handles SQL generation, migrations, and relationship management automatically.
- **`pg`:** The raw PostgreSQL driver that allows Node.js to talk to the database. TypeORM uses this under the hood.
- **`@supabase/supabase-js`:** The official SDK for interacting with Supabase Storage (Buckets) and Authentication.
- **`class-transformer`:**
  - Used in DTOs to transform incoming data.
  - **Crucial Use Case:** Converting "comma-separated strings" from multipart/form-data requests into proper Arrays (e.g. `['tech', 'news']`) before validation runs.

### 📂 Key Project Structure

We expanded the monolithic structure to include multiple feature domains.

```text
src/
├── app.module.ts               # Database Connection (TypeOrmModule.forRoot)
├── users/                      # Users Module
│   └── entities/user.entity.ts # Tracks 'postsCount' (Denormalization)
├── posts/                      # Posts Module (The Aggregate Root)
│   ├── entities/
│   │   ├── post.entity.ts      # Main Entity (@Index, @OneToMany)
│   │   └── like.entity.ts      # Child Entity (@Unique Constraint)
│   ├── dto/                    # Handles Validation + Transformation
│   └── posts.service.ts       # Contains Transaction & Upload Logic
├── comments/                   # Comments Module
├── tags/                       # Tags Module
│   └── entities/tag.entity.ts  # M:N Relation (No array initialization!)
└── common/                     # Shared Filters/Interceptors (From Day 1)
```

### 🧠 Concepts Mastered

**1. Relational Mapping Strategy**

We moved beyond simple CRUD to specific architectural patterns:

- **Entities vs. Tables:** Understanding that one Class = One Table.
- **Dependency Injection for Repositories:** Using `TypeOrmModule.forFeature([Entity])` to inject specific repository tools into a Module's context.

**2. The Transaction Pattern (ACID)**

Code that modifies multiple tables must be atomic.

```typescript
// The Pattern:
await queryRunner.startTransaction();
try {
  await manager.save(Post); // Operation A
  await manager.increment(User); // Operation B
  await queryRunner.commitTransaction();
} catch {
  await queryRunner.rollbackTransaction(); // Undo ALL if any fail
}
```

**3. The Saga Pattern (Distributed Transactions)**

Since the Database (Postgres) and File Storage (Supabase) are separate systems, they cannot share a database transaction.

- **Strategy:** Perform the irreversible action (Upload) first.
- **Compensation:** If the transaction fails, trigger a cleanup action (Delete File).

**4. Database Performance Tuning**

- **Indexing (`@Index`):** Creates B-Tree structures for instant lookups on specific columns. Vital for WHERE clauses.
- **Denormalization:** Storing calculated values (likeCount) on the parent table.
- **Trade-off:** Slower Writes (need to update 2 tables) ➔ Faster Reads (instant number retrieval).
- **Avoiding Circular Dependencies:** Using `forwardRef()` or keeping tightly coupled entities (Post + Like) in the same module to prevent architectural loops.

**5. Handling multipart/form-data**

Traditional JSON DTOs fail with file uploads because data arrives as strings.

We used `@Transform(({ value }) => ...)` to parse metadata strings into arrays/objects before validation logic checks them.
