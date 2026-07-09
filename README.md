# FactorCore

Durante el desarrollo se priorizó el diseño del dominio y la documentación de decisiones técnicas antes de iniciar la implementación. El objetivo fue construir una solución mantenible, fácilmente extensible y con reglas de negocio claramente aisladas de la infraestructura.

> *"The business rules drive the design. Frameworks, databases, and libraries are implementation details."*

---

## Project Status

*   ✅ **Domain Modeling**
*   ✅ **Business Rules**
*   ✅ **Architecture**
*   🔄 **Infrastructure**
*   ⬜ **Customer Registration**
*   ⬜ **Factoring Operations**
*   ⬜ **Customer Summary**
*   ⬜ **Integration Tests**
*   ⬜ **Final Documentation**

---

## Estructura del Proyecto

*   **[PROJECT_GUIDE.md](PROJECT_GUIDE.md):** La guía principal y única fuente de verdad técnica y de negocio del proyecto. Contiene la definición del equipo, principios, glosario del dominio, invariantes, alcance y arquitectura general.
*   **[docs/](docs/):** Carpeta de documentación técnica detallada y viva del proyecto:
    *   **[architecture/](docs/architecture/):** Registro de Decisiones de Arquitectura (ADRs), especificaciones de diseño y el [modelo de dominio](file:///Users/sauloalaniz/Documents/financial-api/docs/architecture/domain-model.md).
    *   **[development/](docs/development/):** Diario de ingeniería (Engineering Journal), roadmap, decisiones de desarrollo y notas de desarrollo asistido.
    *   **[knowledge-base/](docs/knowledge-base/):** Artículos técnicos y de análisis (Clean Architecture, DDD, SQLite, tradeoffs y [siguientes iteraciones](file:///Users/sauloalaniz/Documents/financial-api/docs/knowledge-base/next-iterations.md)).

---

## Principios Técnicos Clave

1.  **Business First:** El software existe para resolver necesidades del negocio financiero de factoraje.
2.  **Clean Architecture:** Dominio totalmente aislado del framework NestJS y la persistencia de base de datos.
3.  **Domain-Driven Design (DDD):** El modelo del dominio guía el diseño del software utilizando lenguaje ubicuo, agregados, entidades y Value Objects inmutables.

---

## Guía de Inicio Rápido

*   Para entender las reglas de negocio, roles del equipo de ingeniería y el roadmap de desarrollo, lee **[PROJECT_GUIDE.md](PROJECT_GUIDE.md)**.
