# Architecture and Design Trade-offs

## 1. Manual Mappers vs. Direct ORM Entities
*   **Decision:** Implement manual converting classes (Mappers) to map Prisma database models to domain entities.
*   **Trade-off:**
    *   *Cons:* Requires writing and maintaining additional boilerplate code.
    *   *Pros:* Keeps the domain layer completely isolated from the database schema details. If tables are refactored, only the Mapper changes.

## 2. SQLite vs. Enterprise DB in Development
*   **Decision:** Use SQLite for local development and E2E testing.
*   **Trade-off:**
    *   *Cons:* SQLite lacks advanced locking mechanisms (optimistic/pessimistic row-level locking) compared to PostgreSQL.
    *   *Pros:* Zero configuration and lightweight execution. Transactions are managed securely using Prisma adapters.

## 3. Pure TypeScript Use Cases vs. NestJS Injected Services
*   **Decision:** Keep Use Cases as pure TS classes, injecting repositories using pure TS constructors.
*   **Trade-off:**
    *   *Cons:* Requires manual module provider binding configuration in NestJS.
    *   *Pros:* Total framework independence. Use cases can be tested in isolation without compiling NestJS modules.
