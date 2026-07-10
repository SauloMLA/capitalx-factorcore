# NestJS Module Hierarchy Design

Locked in **Commit 008** — must be respected by every subsequent commit.
This document exists so the dependency graph is explicitly agreed-upon
**before** any module file is written.

---

## Dependency Graph

```
AppModule
  └── InfrastructureModule
        └── DatabaseModule  (@Global)
              └── PrismaService
  └── HttpModule  (Commit 010)
        └── ClientController
        └── OperationController
```

Each `UseCase` is provided directly inside `InfrastructureModule` using the
injection tokens defined in `repository.tokens.ts`.

---

## Rules

### 1. `DatabaseModule` is `@Global`

`PrismaService` is a singleton shared by all repositories.
Marking the module `@Global` means it is registered once in `AppModule` and
available everywhere without repeated `imports: [DatabaseModule]` declarations.

```typescript
@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class DatabaseModule {}
```

### 2. `InfrastructureModule` wires adapters and use cases

```typescript
@Module({
  providers: [
    PrismaService,
    { provide: REPOSITORY_TOKENS.CLIENT,    useClass: PrismaClientRepository },
    { provide: REPOSITORY_TOKENS.OPERATION, useClass: PrismaOperationRepository },
    // Use cases receive repositories via injection tokens (see below)
    RegisterClientUseCase,
    ApproveClientUseCase,
    CreateOperationUseCase,
    GetClientSummaryUseCase,
  ],
  exports: [
    RegisterClientUseCase,
    ApproveClientUseCase,
    CreateOperationUseCase,
    GetClientSummaryUseCase,
  ],
})
export class InfrastructureModule {}
```

Use cases receive their repositories injected with `@Inject(REPOSITORY_TOKENS.CLIENT)`.

### 3. `HttpModule` (future) only imports `InfrastructureModule`

Controllers depend only on Use Cases — never on repositories or PrismaService directly.

### 4. No circular imports

The rule is strict:

```
Domain ← Application ← Infrastructure ← Http
```

Each layer imports only the layer immediately below.
No layer imports anything from a layer above it.

---

## Why use cases live in `InfrastructureModule` (not a separate `ApplicationModule`)

The use cases are pure TypeScript classes with no NestJS decorators.
They could live in any module. Placing them in `InfrastructureModule` avoids
an intermediate module that adds complexity without adding value.
If the project grows to warrant it, extracting an `ApplicationModule` is trivial.
