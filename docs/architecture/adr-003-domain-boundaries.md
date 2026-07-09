# ADR-003: Strict Domain Boundaries Isolation

## Status
Accepted

## Context
Framework dependencies (`@nestjs/common`, `@prisma/client`) and network layer decorators (`class-validator`) must not contaminate the domain directory. Doing so binds business logic to infrastructure APIs, degrading testability and violating Clean Architecture principles.

## Decision
Enforce strict domain isolation inside `src/domain/`:
1.  **No External Imports:** External frameworks, ORM classes, or HTTP decorators are forbidden.
2.  **Pure TypeScript:** Domain Entities, Aggregates, Value Objects, and Domain Services must be implemented in pure TypeScript.
3.  **Ports as Interfaces:** Repositories and external service interfaces are declared as plain TypeScript interfaces.

## Consequences
*   **Testing Velocity:** Unit tests execute instantly without importing framework components.
*   **Boilerplate:** Requires writing manual DTO conversion code and Mapper adapters in the outer layers.
