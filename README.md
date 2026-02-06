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

---

## 📅 Day 3: Security, Authentication & Authorization

**Goal:** Transform the public API into a secure fortress. Implement Stateless Authentication using JWTs (JSON Web Tokens), secure passwords with Bcrypt Hashing, and enforce Authorization Rules (Ownership) so users can only manage their own data.

### 🚀 Key Achievements

- **JWT Authentication System:** Built a complete login flow where users exchange credentials (email/password) for a digital "Access Token."
- **Password Security:**
  - Implemented Hashing using bcrypt (Salt + Hash) to ensure passwords are never stored as plain text.
  - Configured the User entity to automatically hide the password column (`select: false`) from API responses to prevent accidental leaks.
- **Passport Integration:** Integrated `@nestjs/passport` and `passport-jwt` to handle the heavy lifting of token extraction and verification.
- **Route Protection (Guards):** Applied `@UseGuards(AuthGuard('jwt'))` to lock down endpoints (Create/Delete Posts) so only logged-in users can access them.
- **Custom Decorators:** Created a type-safe `@GetUser()` decorator to extract user data from the request cleanly, replacing messy `req.user` calls.
- **Authorization (Ownership):** Implemented logic to ensure User A cannot delete User B's posts, returning 403 Forbidden if attempted.
- **Advanced TypeORM Querying:** Solved a critical bug by using `createQueryBuilder` (or specific select options) to fetch hidden columns (passwords) only when needed for authentication.

### 🛠️ Tech Stack & Dependencies

- **Authentication Strategy:** JWT (Stateless)
- **Encryption:** Bcrypt
- **Middleware:** Passport.js

#### Core Libraries Explained

- **`bcrypt`:** The industry standard for hashing passwords. It is slow by design to prevent "Brute Force" attacks.
  - **Key Concept:** It generates a random "Salt" for every user, so even if two users have the same password (e.g. "password123"), their hashes look completely different.
- **`@nestjs/jwt`:** A helper module that signs (creates) and verifies tokens using a `JWT_SECRET`.
- **`passport` & `passport-jwt`:**
  - **Strategy Pattern:** Passport uses "Strategies" to handle different login types (Google, Facebook, JWT, Local). We implemented the JWT Strategy.
  - It automatically checks the HTTP Header `Authorization: Bearer <token>`, verifies the signature, checks expiration, and attaches the user to `req.user`.

### 📂 Key Project Structure Updates

We expanded the structure to include authentication and authorization.

```text
src/
├── auth/                       # 🆕 The Security Module
│   ├── dto/
│   │   └── login.dto.ts        # Validation for Login
│   ├── auth.controller.ts     # Endpoints (Login/Signup)
│   ├── auth.module.ts         # Bundles JwtModule & Passport
│   ├── auth.service.ts        # Logic (Validate User, Sign Token)
│   └── jwt.strategy.ts        # The "Bouncer" (Validates Token)
├── common/
│   └── decorators/
│       └── get-user.decorator.ts # 🆕 Custom @GetUser() utility
├── users/
│   └── users.service.ts       # Updated with Hashing & findOneByUsername
└── posts/
    ├── posts.controller.ts    # Protected with @UseGuards
    └── posts.service.ts       # Added Ownership Logic (Delete)
```

### 🧠 Concepts Mastered

**1. Authentication vs. Authorization**

- **Authentication (Who are you?):** Verified by the JWT.
  - _Example:_ "I am User ID 5." (Handled by AuthGuard).
- **Authorization (What can you do?):** Verified by Business Logic.
  - _Example:_ "User 5 is trying to delete Post 100. Does Post 100 belong to User 5?" (Handled in PostsService).

**2. The JWT Flow**

- **Client:** Sends Username + Password.
- **Server:** Hashes password, compares with DB. If match → Signs a JSON object (e.g. `{ sub: userId }`) with a Secret Key.
- **Client:** Stores the Token.
- **Future Requests:** Client sends Token in Header. Server verifies signature.

**3. Custom Decorators**

Instead of writing fragile code like:

```typescript
const userId = req.user.userId; // Not type-safe, messy
```

We created a reusable decorator:

```typescript
create(@GetUser('userId') userId: string) // Clean, readable
```

**4. Handling "Hidden" Columns**

We learned that setting `@Column({ select: false })` on the password field is great for security but tricky for Login.

**The Fix:** You must explicitly ask for the password during login.

```typescript
// The "Login" Query
this.repo.findOne({
  where: { username },
  select: ['id', 'username', 'password'], // Force inclusion
});
```

---

## 📘 Day 4: Real-Time Communication & System Architecture

**Goal:** Finish production touches on the REST API, then add real-time communication and a scalable system architecture using WebSockets, Redis, and streaming platforms like Kafka/Kinesis.

### 1. Finishing Touches: Pagination & Documentation

- **Pagination:** Moved from returning all posts to page-based responses (e.g. "page 1, limit 10") using `take` (limit) and `skip` (offset) in TypeORM.
- **Swagger (OpenAPI):** Automated API documentation using `@nestjs/swagger`.
  - Decorators: `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`.
- **Result:** An interactive UI at `/api` where frontend developers can explore and test endpoints without asking for manual docs.

### 2. WebSockets with Socket.IO

- **REST vs WebSockets:**
  - REST: Request–Response (Pull).
  - WebSockets: Event-driven (Push).
- **The Handshake:** WebSockets start as a normal HTTP request; the client asks to upgrade. On `101 Switching Protocols`, the TCP connection stays open.
- **Events:** Instead of URLs like `GET /posts`, we use event names like `"sendMessage"` and `"receiveMessage"`.
- **Socket.IO:** A higher-level framework over WebSockets that adds auto-reconnection, rooms, and acknowledgements.

#### Chat Gateway Implementation

```typescript
@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server; // The main radio tower

  // Listening for "joinRoom" event
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomName); // Adds socket to a specific channel
    client.emit('joinedRoom', `Welcome to ${roomName}`);
  }

  // Listening for "sendToRoom" event
  @SubscribeMessage('sendToRoom')
  handleMessage(@MessageBody() data: any) {
    // Broadcasts ONLY to people in that room
    this.server.to(data.room).emit('receiveMessage', data.message);
  }
}
```

#### The Three Pillars of Socket.IO

- **Rooms (Privacy):**
  - Virtual channels that group sockets.
  - Analogy: Hotel lobby (server) vs private conference room (room).
  - Code: `client.join('room_id')` / `server.to('room_id').emit(...)`.
- **Acknowledgements (Reliability):**
  - Client sends a message and waits for a callback confirming receipt.
  - Analogy: Read receipts (blue ticks) in WhatsApp.
- **Adapters (Scaling):**
  - By default, sockets live in RAM on a single instance.
  - To scale horizontally, we need a shared "brain" (Redis) via an adapter.

#### Debugging with Postman

- **Common Mistake:** Using "Raw WebSocket" mode.
- **Fix:** Use "Socket.IO" mode in Postman.
- **Crucial Lesson:** Clients must listen to specific events. If the server emits `receiveMessage`, the client must have a `receiveMessage` handler or nothing appears.

### 3. Scaling with Redis (The "Shared Brain")

- **Problem:** If User A is connected to Server 1 and User B to Server 2, in-memory sockets cannot talk to each other.
- **Solution: Redis Pub/Sub**
  - Use Redis as a high-speed message broker:
    1. Server 1 receives a message.
    2. Server 1 publishes it to Redis.
    3. Redis broadcasts to all subscribed servers.
    4. Server 2 receives it and forwards it to User B.

#### Redis Internals (Deep Dive)

- **Fire & Forget:** Redis Pub/Sub does not store data. If no one is listening, the message is lost.
- **Performance:**
  - Uses a dictionary (`pubsub_channels`) where keys = channel names and values = a linked list of clients.
  - Lookup is \(O(1)\).
- **Binary Packing:** Adapters compress JSON into binary (e.g. `msgpack`) before sending to save bandwidth.

#### Redis Adapter Core Logic

```typescript
// Two connections are needed:
const pubClient = createClient({ url }); // For publishing (writing)
const subClient = pubClient.duplicate(); // For subscribing (listening)
```

### 4. High-Throughput Streams (Kafka & Kinesis)

- **Problem:** Redis Pub/Sub is fast but forgetful. If a logging server crashes, messages are gone.
- **Need:** Durable, ordered event storage.

#### The Log Abstraction

- **Append-only:** Events are only appended, never mutated.
- **Ordered:** Events are stored in sequence.
- **Durable:** Data persists on disk for hours/days/weeks.

#### Kafka vs Kinesis (High-Level)

- **AWS Kinesis Data Streams:**
  - Managed, serverless model.
  - Routing: Hash-based (Key → MD5 → Shard).
  - Storage unit: Shard (throughput-limited).
- **Apache Kafka:**
  - Distributed software (self-hosted/Confluent).
  - Routing: Custom partitioner logic.
  - Storage unit: Partition (backed by segment files on disk).
  - Speed secret: Zero-copy I/O (disk → network directly, bypassing user-space copies).

#### When to Use What

- **Redis Pub/Sub:** Live chat, notifications, "who is online" — volatile data.
- **Streams (Kafka/Kinesis):** Payment logs, analytics, audit trails, replaying history — durable data.

#### Real-World Architecture Examples

- **Chat:** Use WebSockets + Redis for real-time delivery, and send messages to Kafka/Kinesis to persist chat history asynchronously.
- **Video:** Do not stream raw video bytes through Kafka. Use Kafka for control signals (start/stop/pause) and use UDP/WebRTC or a dedicated media pipeline for the actual video.

---

## 📘 Day 5: Async Architecture, Queues & Big Data

**Goal:** Never block the main thread. Offload heavy or slow tasks (emails, payroll, reports, analytics) to background workers and design for large-scale data processing.

### 1. Local Queue Implementation (BullMQ)

We used **BullMQ**, a Node.js queue library that uses Redis to manage background jobs.

#### 1.1 Producer / Consumer Architecture

- **Producer (API):** Accepts the HTTP request and pushes a small data packet (job) into Redis, then returns immediately.
- **Queue (Broker):** Redis holds jobs reliably until a worker is ready.
- **Consumer (Worker):** A separate background process that watches Redis and executes heavy logic when jobs appear.

#### 1.2 Payroll Example

**Step 1: Configuration (`app.module.ts`)**

```typescript
BullModule.forRootAsync({
  useFactory: () => ({
    connection: { url: process.env.REDIS_URL }, // Connects to Redis
  }),
});
```

**Step 2: Producer (`payroll.controller.ts`)**

The controller receives a list of employees and pushes jobs into the queue (often with `addBulk()` for many employees).

```typescript
await this.payrollQueue.add(
  'calculate-salary',
  { employeeId: 101 },
  {
    attempts: 3, // Retry up to 3 times
    backoff: 5000, // Wait 5 seconds between retries
  },
);
```

**Step 3: Consumer (`payroll.processor.ts`)**

```typescript
@Processor('payroll-queue')
export class PayrollProcessor extends WorkerHost {
  async process(job: Job): Promise<any> {
    // 1. Heavy work
    console.log(`Processing ${job.data.employeeId}...`);
    await heavyMathCalculation();

    // 2. Result stored in Redis history
    return { status: 'paid' };
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.log(`Job ${job.id} failed! Reason: ${error.message}`);
  }
}
```

#### 1.3 BullMQ Internals

BullMQ manages a **state machine** inside Redis, moving jobs through lists:

- **wait:** Queued, waiting for a worker.
- **active:** Picked up by a worker (locked).
- **completed:** Finished successfully.
- **failed:** Finished with an error.
- **delayed:** Scheduled for the future (e.g., "send email in 24 hours").

### 2. Cloud Queues (AWS SQS)

Redis is powerful but RAM-based. For very large, durable workloads, we use **AWS SQS**.

#### 2.1 Redis vs SQS (High-Level)

- **Storage:**
  - Redis (BullMQ): In-memory; extremely fast but limited.
  - SQS: Disk/cloud-backed; virtually unlimited.
- **Latency:**
  - Redis: Ultra-low (\<5ms).
  - SQS: Moderate (~50ms).
- **Maintenance:**
  - Redis: You manage the cluster.
  - SQS: Fully managed (serverless).

Best fit:

- **BullMQ/Redis:** Complex, prioritized, near-real-time jobs.
- **SQS:** Extremely high-volume, simple "pipe" workloads with strong durability.

#### 2.2 Visibility Timeout

Instead of locks, SQS uses a **Visibility Timeout**:

1. Worker A receives a message → it becomes invisible for X seconds.
2. If Worker A **finishes** early, it **deletes** the message.
3. If Worker A **crashes**, the timeout expires and the message becomes visible again for Worker B.

**Rule:** Set Visibility Timeout **greater** than your max job processing time.

#### 2.3 Dead Letter Queue (DLQ)

- Without a DLQ, a "poison pill" message can crash workers in an infinite loop.
- With a DLQ, after \(N\) failed attempts (e.g., 5), SQS moves that message to a **Dead Letter Queue** for manual inspection.

### 3. Data Warehousing (Handling Big Data)

Postgres is for **apps**; Redshift/Snowflake/BigQuery are for **analytics**.

#### 3.1 OLTP vs OLAP

- **OLTP (Online Transaction Processing):**
  - DB: Postgres, MySQL.
  - Layout: Row-oriented.
  - Strength: Fast single-row `INSERT`/`UPDATE`/`DELETE`.
  - Weakness: Slow for large aggregations.
  - Use cases: Orders, profiles, chat messages.

- **OLAP (Online Analytical Processing):**
  - DB: Redshift, Snowflake, BigQuery.
  - Layout: Column-oriented.
  - Strength: Very fast aggregations (sums, averages, group-bys).
  - Weakness: Poor for frequent single-row updates.
  - Use cases: Dashboards, reports, long-term metrics.

#### 3.2 ETL Pipeline into Redshift

Because OLAP systems prefer bulk loads, we **never** write directly to Redshift from the API:

1. **API:** Sends events/logs into a streaming service (e.g. Kinesis Firehose).
2. **Firehose:** Buffers until a threshold (e.g. 5MB).
3. **S3:** Firehose writes batched JSON/CSV files to S3.
4. **Redshift:** Uses the `COPY` command to ingest data in bulk.

```sql
-- Core data engineering command
COPY analytics_table
FROM 's3://bucket/data.json'
IAM_ROLE 'arn:aws:iam::...'
FORMAT AS JSON 'auto';
```
