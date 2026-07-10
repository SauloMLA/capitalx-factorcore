# FactorCore

Durante el desarrollo se priorizó el diseño del dominio y la documentación de decisiones técnicas antes de iniciar la implementación. El objetivo fue construir una solución mantenible, fácilmente extensible y con reglas de negocio claramente aisladas de la infraestructura.

> *"The business rules drive the design. Frameworks, databases, and libraries are implementation details."*

---

## Project Status

*   ✅ **Domain Modeling** (Lenguaje ubicuo, glosario y modelado de agregados)
*   ✅ **Business Rules** (Cálculo de aforo del 85%, comisión del 1.5% e invariantes de fecha 15-120 días)
*   ✅ **Architecture** (ADR-001 al ADR-003, modelo de dominio y segregación en capas)
*   ✅ **Infrastructure** (Adapters de persistencia concretos de Prisma + SQLite y mapeadores explícitos)
*   ✅ **Dependency Injection** (Módulos de NestJS desacoplados mediante proveedores fábrica)
*   ✅ **HTTP Layer** (Controladores de clientes y operaciones, DTOs validados con class-validator)
*   ✅ **Exception Handling** (Filtro global de excepciones con mapeos de errores de negocio a HTTP)
*   ✅ **Swagger Docs** (OpenAPI interactivo documentando todos los endpoints en `/api`)
*   ✅ **Integration Tests** (Suites unitarias y de integración de extremo a extremo con SQLite de prueba)

---

## Estructura del Proyecto

*   **[PROJECT_GUIDE.md](PROJECT_GUIDE.md):** La guía principal y única fuente de verdad técnica y de negocio del proyecto.
*   **[docs/](docs/):** Carpeta de documentación técnica viva del proyecto:
    *   **[architecture/](docs/architecture/):** ADRs y especificaciones como [module-hierarchy.md](docs/architecture/module-hierarchy.md).
    *   **[development/](docs/development/):** Diario de ingeniería ([engineering-journal.md](docs/development/engineering-journal.md)) y roadmap.
    *   **[knowledge-base/](docs/knowledge-base/):** Artículos técnicos ([tradeoffs.md](docs/knowledge-base/tradeoffs.md) y [next-iterations.md](docs/knowledge-base/next-iterations.md)).
*   **`src/`:** Código fuente estructurado bajo Clean Architecture:
    *   `src/domain/`: Entidades, Agregados, Value Objects y puertos de repositorios sin dependencias externas.
    *   `src/application/`: Casos de uso de negocio puros, independientes del framework.
    *   `src/infrastructure/`: Adapters concretos de persistencia (Prisma), DTOs, controladores NestJS y filtros.

---

## Guía de Instalación y Ejecución

### 1. Requisitos
*   Node.js (versión >= 20)
*   npm

### 2. Configuración del Entorno
Crea las bases de datos de desarrollo y prueba locales:
```bash
# Copia la plantilla de configuración de variables de entorno
cp .env.example .env

# Instala todas las dependencias
npm install

# Crea la base de datos de desarrollo local y aplica migraciones
npx prisma migrate dev --name init
```

### 3. Ejecución de Pruebas
El proyecto tiene un alto estándar de calidad con cobertura en todas las capas:
```bash
# Ejecutar todas las pruebas unitarias (Dominio, Casos de uso, Mapeadores)
npm run test

# Ejecutar las pruebas de integración End-to-End (E2E)
npm run test:e2e
```

### 4. Iniciar el Servidor
```bash
# Iniciar la aplicación NestJS en modo desarrollo (Puerto 3000 por defecto)
npm run start:dev
```

### 5. Documentación Interactiva de la API
Con el servidor encendido, puedes acceder a la documentación interactiva y probar los endpoints directamente en:
👉 [http://localhost:3000/api](http://localhost:3000/api)

---

## Endpoints Disponibles

1.  `POST /clientes`: Registro de un cliente en estado pendiente.
2.  `PATCH /clientes/{id}/aprobar`: Aprobación de un cliente para autorizar originaciones.
3.  `POST /operaciones`: Originación de una operación de factoraje con una o más facturas.
4.  `GET /clientes/{id}/resumen`: Obtención del resumen ejecutivo con métricas de factoraje de un cliente.
