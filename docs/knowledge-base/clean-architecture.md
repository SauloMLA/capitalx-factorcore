# Clean Architecture

## 1. Business Context
In **FactorCore**, business rules are the project's most valuable asset: commercial discount formulas, credit limits check logic, and invoice eligibility checks. Frameworks (NestJS), database systems (SQLite), and libraries (Prisma) are exchangeable implementation details.

## 2. Structural Principles
1.  **Framework Independence:** The core domain logic is written in pure TypeScript. If NestJS or Prisma is replaced, the domain and application layers remain untouched.
2.  **Testability:** Business flows are tested using fast unit tests without having to mock network calls or relational databases.
3.  **Dependency Inversion Principle (DIP):** Outer layers depend on inner layers. When a Use Case in the application layer needs to retrieve or save data, it communicates using interfaces (Ports) defined in the domain layer. The infrastructure adapters implement these interfaces.

## 3. Data Flow
*   **Request HTTP** ➔ **Controller (Adapters)** ➔ **Use Case (Application)** ➔ **Entity/Value Object (Domain)**.
*   **Use Case (Application)** ➔ **Repository Interface (Domain Ports)** ➔ **Prisma Repository (Infrastructure Adapter)** ➔ **SQLite**.
