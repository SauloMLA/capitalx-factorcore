# ADR-001: Clean Architecture and DDD Adoption

## Status
Accepted

## Context
FactorCore requires extreme protection of credit calculations, commercial discount logic, and invoice eligibility checks from database, network framework, and infrastructure changes.

## Decision
Adopt **Clean Architecture** combined with **Domain-Driven Design (DDD)** as the core architectural patterns:
1.  **Concentric Layers:** Core domain logic sits at the center (`src/domain/`), coordinates actions through the application use cases (`src/application/`), maps data in adapters (`src/interface/`), and integrates NestJS/Prisma in the infrastructure layer (`src/infrastructure/`).
2.  **DIP (Dependency Inversion):** Application layer depends on Domain Ports (Interfaces). Infrastructure implements these interfaces.

## Consequences
*   **Mantenibilidad:** Complete separation of business rules from framework changes.
*   **Testabilidad:** Domain business rules can be verified using rapid, isolated unit tests.
*   **Boilerplate:** Requires writing manual converting logic (Mappers) between physical and domain layers.
