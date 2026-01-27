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
