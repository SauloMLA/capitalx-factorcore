# Development Decisions

This document compiles the fundamental design and process decisions agreed upon by the engineering team during the initialization phase of **FactorCore**.

---

## DD-001: Engineering Roles and Team Structure

### Context
Before starting development, we needed to define clear engineering responsibilities, principles, and software quality boundaries for the project lifecycle.

### Decision
Define specialized team roles (Architect, Domain Expert, Developer, API Designer, DB Specialist, QA) and establish a strict 10-step sequential working agreement (*Understand -> Domain -> Rules -> Arch -> API -> Persistence -> Implement -> Test -> Document -> Optimize*).

### Rationale
Assigning specific roles ensures all aspects of clean code, BDD/TDD, and documentation are systematically reviewed. A sequential process prevents writing code before understanding the business.

### Consequences
No code implementation can start until domain modeling, rules, and architecture designs are fully agreed upon and documented.

---

## DD-002: Project Definition and Scope

### Context
We needed to define the scope and technologies of the factoring API (**FactorCore**) as a production-ready system rather than a simplified technical task.

### Decision
Model the system as a decoupled lending core. Stack chosen: NestJS, SQLite, Prisma ORM, Swagger, Jest, and Docker. SQLite serves as the development database.

### Rationale
Using the Repository Pattern hides SQLite details behind domain interfaces, allowing swapping to a production system (like PostgreSQL) without changing business rules.

### Consequences
NestJS and the database are isolated as implementation details, keeping business logic clean.

---

## DD-003: Domain Model Core Boundaries

### Context
The factoring business rules (credit line limits, simple discount calculations, invoice uniqueness) needed protection against data corruption and system boundaries leak.

### Decision
Encapsulate all business rules inside domain aggregates (`Issuer`, `Debtor`, `Invoice`, `FinancingRequest`) and Value Objects (`TaxId`, `Money`, `Percentage`, `InvoiceFolio`).

### Rationale
Domain invariants must be guarded within aggregate roots (e.g., debtor's credit limits) to prevent inconsistent state, and value objects must validate their own format at construction.

### Consequences
Domain models are written in pure TypeScript and are 100% independent of ORMs and framework decorators.

---

## DD-004: Folder Structure and Layer Layout

### Context
We needed to design a scalable folder structure that enforces Concentric Layer dependencies.

### Decision
Design `src/` into four concentric layers:
*   `domain/`: Entities, Value Objects, Domain Services, and Repository Interfaces (Ports).
*   `application/`: Coordinate flows through Use Cases.
*   `interface/` (or `adapters/`): HTTP Controllers, DTOs, and manual data Mappers.
*   `infrastructure/`: Framework setup (NestJS) and Database Client (Prisma).

### Rationale
Concentric dependencies guarantee that inner layers (domain) have zero imports from outer layers (Prisma/NestJS), ensuring decoupling and testability.

### Consequences
A clear folder structure where boundaries are guarded. Manual data mappers translate database models to domain entities at the outer boundary.

---

## DD-005: Commit Strategy

### Context
Define how the codebase will grow and ensure incremental quality check gates.

### Decision
Adhere to a strict commit flow using Conventional Commits. Every commit must represent a single, atomic logical change, compile successfully, and keep tests passing.

### Rationale
Small commits simplify code review, debugging, and rollback operations, keeping the repository history clean and professional.

### Consequences
We will not merge multiple vertical slices or large refactors into a single commit.

---

## Development Notes

Brainstorming and design discussions were assisted by LLM tools. Final architecture and implementation decisions were validated manually before being incorporated into the project.
