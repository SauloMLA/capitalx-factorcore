# PROJECT_GUIDE

Esta es la única fuente de verdad técnica y de negocio para el desarrollo del proyecto **FactorCore**. Ningún desarrollador o agente de software puede asumir información que no esté explícitamente documentada aquí.

---

## 1. Visión del Proyecto
**FactorCore** es un motor simplificado de originación financiera diseñado específicamente para gestionar operaciones de factoraje (factoring) corporativo bajo las reglas de negocio de **Capital X**.

El sistema permite a empresas registradas y aprobadas (Clientes) ceder sus derechos de cobro contenidos en facturas vigentes para obtener liquidez anticipada de forma rápida, segura y bajo una arquitectura de software limpia y desacoplada del framework y base de datos.

---

## 2. Contexto del Negocio
El factoraje financiero en **FactorCore** se modela exactamente mediante dos flujos operativos clave:
1.  **Alta y Aprobación de Clientes:** Toda empresa proveedora (cliente) que desea anticipar facturas debe ser dada de alta y aprobada explícitamente en el sistema antes de poder originar cualquier operación financiera.
2.  **Originación de Operaciones:** El cliente cede una o más facturas válidas. La plataforma calcula el anticipo correspondiente aplicando un porcentaje de aforo fijo y cobrando una comisión fija por el servicio, depositando el monto neto resultante.

---

## 3. Reglas de Negocio (Invariantes)

### Módulo de Clientes (Clientes)
*   **RD-CLI-001 (Ciclo de Vida):** Todo cliente inicia en estado `PENDING`. Debe ser activado explícitamente al estado `APPROVED` para poder operar.
*   **RD-CLI-002 (Identidad Fiscal):** El identificador fiscal del cliente (RFC) debe ser de **Persona Moral** en México (estrictamente 12 caracteres alfanuméricos con formato `[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}`).
*   **RD-CLI-003 (Unicidad):** No se permiten dos clientes registrados con el mismo RFC.

### Módulo de Facturas (Invoices)
*   **RD-INV-001 (Monto Mayor a Cero):** El monto total de cada factura presentada debe ser estrictamente mayor a cero.
*   **RD-INV-002 (Fechas Válidas):** La fecha de emisión de la factura no puede estar en el futuro respecto a la fecha de la solicitud, y la fecha de vencimiento debe ser posterior a la fecha de la solicitud.
*   **RD-INV-003 (Plazo de Elegibilidad):** El término restante de la factura (tiempo calendario entre la fecha de solicitud y su vencimiento) debe encontrarse **estrictamente entre 15 y 120 días calendario**.

### Módulo de Operaciones (Operations)
*   **RD-OP-001 (Estado del Cliente):** Una operación sólo puede crearse si el cliente asociado está en estado `APPROVED`.
*   **RD-OP-002 (Prevención de Doble Financiamiento):** No se pueden financiar folios de facturas duplicados en la misma operación ni folios que ya hayan sido financiados en operaciones previas del mismo cliente.
*   **RD-OP-003 (Cálculos de Aforo y Comisión):** Las fórmulas matemáticas para el anticipo y costo son:
    *   `Monto Total` = Suma de los montos de todas las facturas del lote.
    *   `Monto Adelantado` = `Monto Total * 0.85` (Aforo fijo del 85%).
    *   `Comisión` = `Monto Total * 0.015` (Comisión fija del 1.5%).
    *   `Monto a Depositar` = `Monto Adelantado - Comisión`.
    *   *Todos los montos se redondean a exactamente 2 decimales.*

---

## 4. Arquitectura y Capas

El diseño del sistema se rige bajo **Clean Architecture** y **Domain-Driven Design (DDD)** para garantizar que las reglas de negocio manejen el diseño y la infraestructura sea un simple detalle de implementación.

```
Domain Layer (src/domain/)
  └── Entidades, Agregados y Value Objects (Pure TS)
  └── Interfaces de Repositorio (Ports)

Application Layer (src/application/)
  └── Casos de Uso (Pure TS, sin decoradores NestJS)

Infrastructure Layer (src/infrastructure/)
  └── NestJS Modules, Controllers, DTOs y HttpExceptionFilter
  └── Prisma client, repositorios concretos y SQLite database
```

---

## 5. Decisiones de Diseño y Trade-offs Técnicos

### 1. Mapeadores de Datos Manuales vs. Entidades ORM Directas
*   **Decisión:** Crear clases `Mapper` explícitas para convertir los modelos físicos de Prisma (`ClientRecord`, `OperationRecord`, `InvoiceRecord`) a entidades y agregados del dominio (`Client`, `Operation`, `Invoice`), y viceversa.
*   **Trade-off:** Requiere escribir y mantener código redundante de conversión, pero garantiza que la capa de dominio sea 100% inmune a refactorizaciones de las tablas o migración de base de datos.

### 2. Casos de Uso Puros vs. Servicios Inyectados con NestJS
*   **Decisión:** Mantener los Use Cases de la capa de aplicación como clases de TypeScript puras. NestJS los inyecta en el controlador usando proveedores fábrica (`useFactory`).
*   **Trade-off:** Requiere declarar explícitamente los bindings en `InfrastructureModule`, pero permite testear los flujos de aplicación en milisegundos con dobles en memoria sin arrancar ni mockear componentes de NestJS.

### 3. Evitar Estado de Operaciones (YAGNI)
*   **Decisión:** La entidad `Operation` no almacena estados intermedios como `OperationStatus` (creada, aprobada, rechazada). Una operación simplemente se crea de forma exitosa o falla arrojando una excepción en caso de que alguna de las facturas no cumpla con las invariantes.
*   **Trade-off:** Ahorra complejidad innecesaria en el modelo de base de datos y memoria, alineándose estrictamente al alcance del reto.

---

## 6. Referencias Técnicas
*   [ADR-001: Clean Architecture and DDD Adoption](file:///Users/sauloalaniz/Documents/financial-api/docs/architecture/adr-001-clean-architecture.md)
*   [ADR-002: Local Persistence Strategy with SQLite and Prisma ORM](file:///Users/sauloalaniz/Documents/financial-api/docs/architecture/adr-002-persistence.md)
*   [ADR-003: Strict Domain Boundaries Isolation](file:///Users/sauloalaniz/Documents/financial-api/docs/architecture/adr-003-domain-boundaries.md)
*   [Domain Model Refinado](file:///Users/sauloalaniz/Documents/financial-api/docs/architecture/domain-model.md)
*   [Engineering Journal](file:///Users/sauloalaniz/Documents/financial-api/docs/development/engineering-journal.md)
