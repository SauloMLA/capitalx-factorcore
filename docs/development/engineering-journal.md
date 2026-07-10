# Engineering Journal

Bitácora técnica de desarrollo y notas diarias de la ingeniería de **FactorCore**.

---

## July 9

### Today's goal
Definir los cimientos del proyecto y la estructura arquitectónica inicial. Modelar conceptualmente el dominio de la originación de factoraje financiero y establecer la documentación técnica de soporte.

### Main decisions
*   **Decoupled Domain:** El dominio estará completamente libre de dependencias tecnológicas externas. La carpeta `src/domain/` será escrita en TypeScript puro, abstrayendo persistencia y entrega a través de interfaces (Puertos).
*   **Línea de Crédito como Invariante:** El agregado `Debtor` controlará de manera interna el saldo disponible para prevenir condiciones de carrera transaccionales.
*   **Estrategia de Documentación Organizada:**
    *   Definición de 3 ADRs iniciales (Clean Architecture, Persistence, Domain Boundaries) en lugar de una lista extensa y artificial.
    *   Renombrado del contexto global a `PROJECT_GUIDE.md` para emular una guía de arquitectura real de un producto de software.
    *   Creación del directorio `docs/knowledge-base/` para documentar la justificación técnica de la arquitectura de forma natural, sin connotaciones orientadas exclusivamente a una entrevista.
    *   Creación de la carpeta `docs/rfc/` (Request for Comments) para detallar las propuestas del modelo de dominio, validación y formato de errores.

### Things I learned
*   Establecer la base de persistencia y la arquitectura de capas como simples "detalles de implementación" desde el primer día obliga al equipo a mantener el foco en la lógica de negocio antes de entrar a programar con NestJS.
*   El uso de mappers manuales para convertir modelos ORM físicos a entidades del dominio, si bien genera más código base inicial, es la forma más segura de evitar acoplamientos técnicos en el núcleo del sistema.

### Open questions
*   ¿Deberíamos incorporar soporte multi-moneda desde la versión inicial o manejarlo como una mejora a futuro para mantener el desarrollo ágil? (De momento se asume una única moneda base, documentado como mejora futura).

### Next milestone
Inicializar la persistencia física local (SQLite + Prisma) y definir el esquema físico en la Fase 1.

---

## July 10

### Today's goal
Inicializar el espacio de trabajo físico del proyecto con NestJS y habilitar el tipado estricto en TypeScript.

### Main decisions
*   Scaffold de NestJS ejecutado mediante `@nestjs/cli` omitiendo la inicialización de git local (`--skip-git`) para preservar nuestra base de documentación.
*   Habilitar `"strict": true` de manera global en `tsconfig.json` para garantizar el máximo nivel de tipado estricto en la lógica de negocio.
*   Creación de un archivo `.gitignore` robusto que ignore artefactos compilados (`dist/`) y dependencias (`node_modules/`).

### Things I learned
*   El uso de `--skip-git` de NestJS CLI evita la sobre-escritura accidental del repositorio git configurado.

### Open questions
*   Ninguna.

### Next milestone
Implementar el Commit 002: Configuración del esquema físico de Prisma y base de datos local SQLite.
