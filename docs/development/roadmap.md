# Project Roadmap

Seguimiento ejecutivo del progreso de las fases de desarrollo acordadas en el [PROJECT_GUIDE.md](file:///Users/sauloalaniz/Documents/financial-api/PROJECT_GUIDE.md).

---

## Estado del Proyecto

*   `[x]` **Domain Modeling:** Lenguaje ubicuo, glosario y modelado conceptual de agregados.
*   `[x]` **Business Rules:** Identificación y clasificación de invariantes (P0, P1, P2) en el contexto.
*   `[x]` **Ubiquitous Language:** Glosario y modelado de objetos alineados con el negocio.
*   `[x]` **Architecture Decision Records:** Registro y justificación de decisiones fundamentales (ADR-001 al ADR-003).
*   `[x]` **Infrastructure:** Configuración física de `src/`, e inicialización de NestJS.
*   `[x]` **Implementation (Domain Layer):** Value Objects, Client aggregate, Invoice entity, Operation aggregate — dominio completo.
*   `[x]` **Implementation (Application Layer):** Casos de uso de registro de cliente, aprobación y creación de operación.
*   `[x]` **Implementation (Infrastructure Layer & DI):** Adapters Prisma, mappers, DatabaseModule, InfrastructureModule, DI wiring.
*   `[/]` **Implementation (HTTP Layer):** Controladores, DTOs y mapeos sin exception filters.
*   `[ ]` **Testing:** Pruebas unitarias sobre casos de uso/dominio y de integración E2E.
*   `[ ]` **Documentation:** OpenAPI/Swagger completo y manuales de integración de la API.
*   `[ ]` **Final Review:** Revisión de calidad y verificación final.
