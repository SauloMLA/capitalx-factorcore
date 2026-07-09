# ADR-002: Local Persistence Strategy with SQLite and Prisma ORM

## Status
Accepted

## Context
During the prototyping and early development stages, the team requires an ACID-compliant, lightweight relational persistence system with migration control and strong static typing, without the operational overhead of managing external database servers in Docker.

## Decision
Adopt **SQLite** as the database engine and **Prisma ORM** as the database client in the infrastructure layer:
1.  **SQLite:** Stores data in a single local file.
2.  **Prisma ORM:** Manages physical schema declarations (`schema.prisma`) and migrations, generating type-safe database access models.

## Consequences
*   **Speed:** Instant database setup and execution, highly suited for local integrated/E2E testing.
*   **Abstraction:** Because the core communicates via repository interfaces, database engines can be swapped (e.g., PostgreSQL for production) by updating the Prisma connection string, leaving domain rules intact.
*   **Locking Limitations:** SQLite lacks native row-level write concurrency features, which must be handled at the application level if necessary.
