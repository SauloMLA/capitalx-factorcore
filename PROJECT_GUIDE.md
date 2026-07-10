# PROJECT_GUIDE

Esta es la única fuente de verdad técnica y de negocio para el desarrollo del proyecto **FactorCore**. Ningún desarrollador o agente de software puede asumir información que no esté explícitamente documentada aquí.

---

## 1. Project Vision
**FactorCore** es un motor de originación financiera diseñado para gestionar el ciclo de vida de operaciones de factoraje (factoring) corporativo. El sistema permite a empresas (Emisores) ceder sus derechos de cobro contenidos en facturas vigentes a una entidad financiera para obtener liquidez inmediata, a cambio de una tasa de descuento nominal anual simple, manteniendo bajo control la exposición de crédito y el saldo disponible de las entidades deudoras.

El objetivo principal es construir una solución que proteja las reglas financieras complejas (el descuento simple y las invariantes de saldo) y permita escalar a nuevos productos de originación (como Confirming o factoring inverso) de manera rápida y sin modificar el núcleo de negocio.

---

## 2. Business Context
El factoraje financiero es un producto de financiamiento alternativo donde una entidad adquiere cuentas por cobrar de un emisor. 

En este contexto, intervienen tres entidades principales:
1.  **Emisor (Issuer):** Empresa proveedora que cede sus facturas a cambio de pago inmediato (menos descuento).
2.  **Deudor (Debtor):** Gran corporación obligada a liquidar las facturas al vencimiento.
3.  **Factor (Plataforma):** Entidad financiera que adquiere los derechos, realiza el cobro final y cobra una comisión/tasa de descuento.

El sistema asume que las facturas ingresadas son legítimas, válidas y pre-calculadas en sistemas de facturación gubernamentales externos. La moneda del sistema es base y única.

---

## 3. Business Rules

### Módulo de Deudores (Debtors)
*   **RD-DEB-001 (Línea de Crédito):** Todo deudor debe tener asignada una línea de crédito aprobada. No se permite crear solicitudes de financiamiento si el saldo acumulado (financiamientos vigentes no cobrados) excede dicho límite.
*   **RD-DEB-002 (Estado del Deudor):** Un deudor inactivo o suspendido no puede participar en nuevas solicitudes de factoraje.

### Módulo de Facturas (Invoices)
*   **RD-INV-001 (Duplicidad):** No se permiten facturas duplicadas en el sistema. La unicidad está determinada por la combinación del folio de la factura y el id del emisor.
*   **RD-INV-002 (Vigencia):** Solo se pueden financiar facturas cuya fecha de vencimiento sea superior a la fecha de la solicitud por al menos 15 días calendario.
*   **RD-INV-003 (Monto Mínimo):** El monto total de una factura presentada para financiamiento debe ser superior a un monto umbral mínimo parametrizado en el sistema.

### Módulo de Financiamientos (Financing Requests)
*   **RD-FIN-001 (Porcentaje de Financiamiento):** El monto financiado no puede superar el 90% del valor total de las facturas cedidas. El porcentaje restante queda retenido como garantía hasta el cobro de la factura.
*   **RD-FIN-002 (Tasa de Descuento):** El cálculo de la tasa de descuento debe considerar los días restantes para el vencimiento de la factura aplicando la fórmula de descuento comercial simple nominal anual.
*   **RD-FIN-003 (Aprobación):** Cualquier solicitud que supere un monto determinado requiere aprobación manual de un analista de riesgos; solicitudes menores a este monto pueden ser aprobadas automáticamente por el motor de reglas si cumplen con los límites del deudor.

---

## 4. Architecture Overview
El diseño del sistema se rige bajo **Clean Architecture** y **Domain-Driven Design (DDD)** para garantizar que las reglas de negocio manejen el diseño y la infraestructura sea un simple detalle de implementación.

*   **Domain Layer (`src/domain/`):** Contiene los modelos de dominio puros (Entidades, Agregados y Value Objects) y los puertos de repositorios (interfaces). No tiene dependencias de NestJS ni de Prisma.
*   **Application Layer (`src/application/`):** Contiene los casos de uso coordinadores del flujo.
*   **Interface Layer (`src/interface/`):** Controladores de API REST, DTOs y mapeadores manuales de base de datos.
*   **Infrastructure Layer (`src/infrastructure/`):** Framework NestJS, migración física de Prisma y base de datos local SQLite.

### Decisiones de Arquitectura Aprobadas (ADRs)
*   [ADR-001: Clean Architecture and DDD Adoption](file:///Users/sauloalaniz/Documents/financial-api/docs/architecture/adr-001-clean-architecture.md)
*   [ADR-002: Local Persistence Strategy with SQLite and Prisma ORM](file:///Users/sauloalaniz/Documents/financial-api/docs/architecture/adr-002-persistence.md)
*   [ADR-003: Strict Domain Boundaries Isolation](file:///Users/sauloalaniz/Documents/financial-api/docs/architecture/adr-003-domain-boundaries.md)
*   [Design Session](file:///Users/sauloalaniz/Documents/financial-api/docs/architecture/design-session.md) - Especificación del diseño de carpetas, excepciones y flujo de peticiones.

---

## 5. Roadmap

*   `[x]` **Domain Modeling:** Lenguaje ubicuo, glosario y modelado conceptual de agregados.
*   `[x]` **Business Rules:** Identificación y clasificación de invariantes (P0, P1, P2) en el contexto.
*   `[x]` **Ubiquitous Language:** Glosario y modelado de objetos alineados con el negocio.
*   `[x]` **Architecture Decision Records:** Registro y justificación de decisiones fundamentales (ADR-001 al ADR-003).
*   `[x]` **Infrastructure:** Configuración física de `src/`, e inicialización de NestJS.
*   `[/]` **Implementation:** Escritura de entidades, Value Objects y casos de uso en progreso.
*   `[ ]` **Testing:** Pruebas unitarias sobre casos de uso/dominio y de integración E2E.
*   `[ ]` **Documentation:** OpenAPI/Swagger completo y manuales de integración de la API.
*   `[ ]` **Final Review:** Revisión de calidad y verificación final.

---

## 6. References
Para consultar la base de conocimiento y los diarios de desarrollo, diríjase a los siguientes enlaces:
*   [Domain Model](file:///Users/sauloalaniz/Documents/financial-api/docs/architecture/domain-model.md) - El modelo estructural de agregados y Value Objects.
*   [Clean Architecture Rationale](file:///Users/sauloalaniz/Documents/financial-api/docs/knowledge-base/clean-architecture.md)
*   [Domain-Driven Design Rationale](file:///Users/sauloalaniz/Documents/financial-api/docs/knowledge-base/ddd.md)
*   [Persistence Strategy (SQLite)](file:///Users/sauloalaniz/Documents/financial-api/docs/knowledge-base/sqlite.md)
*   [Design Trade-offs](file:///Users/sauloalaniz/Documents/financial-api/docs/knowledge-base/tradeoffs.md)
*   [Next Iterations Plan](file:///Users/sauloalaniz/Documents/financial-api/docs/knowledge-base/next-iterations.md)
*   [Engineering Journal](file:///Users/sauloalaniz/Documents/financial-api/docs/development/engineering-journal.md)
*   [Development Decisions Log](file:///Users/sauloalaniz/Documents/financial-api/docs/development/development-decisions.md)
*   [AI-Assisted Development Log](file:///Users/sauloalaniz/Documents/financial-api/docs/development/ai-assisted-development.md)
