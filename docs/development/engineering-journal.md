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
Implementar el Commit 002: Habilitar Value Objects del Dominio.

---

## July 10 (Sprint Continued)

### Today's goal
Implementar los objetos de valor (Value Objects) core del dominio de factoraje y verificar su comportamiento lógico mediante pruebas unitarias exhaustivas.

### Main decisions
*   **Encapsulación de Invariantes:** Se implementaron `Money`, `Percentage`, `TaxId` e `InvoiceFolio` asegurando que validen su consistencia en el constructor.
*   **Validación RFC:** El Value Object `TaxId` utiliza una expresión regular estricta para validar formatos de personas físicas y morales mexicanas (RFC), sanitizando espacios y guiones automáticamente.
*   **Precisión Monetaria:** El objeto de valor `Money` evita errores de punto flotante redondeando a 2 decimales y lanzando una excepción si se intenta crear una cifra negativa o si una sustracción produce saldos inconsistentes.
*   **Pruebas Integradas:** Se crearon suites de pruebas Jest junto a cada Value Object, logrando una cobertura del 100% en esta funcionalidad base.

### Things I learned
*   El uso de importaciones locales de directorio (`./`) en los specs previene problemas de resolución de módulos durante la ejecución de Jest.

### Open questions
*   Ninguna.

### Next milestone
Implementar el Commit 003: Agregado de Cliente (Client).

---

## July 10 (Sprint Continued)

### Today's goal
Implementar el Agregado de Cliente (`Client`) bajo un enfoque Domain-First simplificado y definir su puerto de repositorio en el dominio.

### Main decisions
*   **Simplificación Operativa:** De acuerdo con la nueva directiva de diseño, se descartaron los agregados complejos de Deudor y Emisor y se unificó la contraparte operativa en el agregado root `Client`.
*   **Atributos y Comportamiento:** El agregado `Client` encapsula `id`, `taxId` (Value Object), `name` (string) y `status` (ClientStatus ACTIVE/INACTIVE). Implementa validaciones de inicialización de negocio y mutadores controlados `activate()` y `deactivate()`.
*   **Puerto de Repositorio:** Se definió la interfaz `ClientRepository` para la búsqueda por ID y TaxId, y almacenamiento de la entidad, desacoplada de cualquier ORM.

### Things I learned
*   Establecer primero el Agregado de Cliente simplifica enormemente las dependencias estructurales de las facturas que vendrán en el siguiente commit.

### Open questions
*   Ninguna.

### Next milestone
Implementar el Commit 004: Entidad Factura (Invoice) simplificada como parte de Operación.

---

## July 10 (Sprint Continued)

### Today's goal
Implementar la entidad de Factura (`Invoice`) bajo el dominio simplificado, asegurando que sea una entidad interna y no un Aggregate Root independiente.

### Main decisions
*   **Aislamiento de la Entidad:** De acuerdo con las instrucciones refinadas de arquitectura, `Invoice` se diseñó como una entidad pura sin repositorio (`InvoiceRepository`) ni estados operativos propios (`InvoiceStatus`), limitándose a responder a su propio comportamiento.
*   **Encapsulación de Datos:** Incorpora folios (`InvoiceFolio`), deudores (`TaxId` y nombre), monto (`Money`) y fechas de emisión y vencimiento.
*   **Determinismo en Fechas:** La lógica de cálculo de días restantes (`getRemainingDays()`) se implementó utilizando partes de fecha UTC (`Date.UTC`), previniendo errores por desplazamientos locales de zona horaria (timezone offsets) en los entornos de ejecución y pruebas.
*   **Criterio de Elegibilidad:** Habilita `isEligibleForFinancing()`, verificando de manera individual que el vencimiento sea de al menos 15 días calendario a partir de una fecha de referencia.

### Things I learned
*   El uso de constructores privados y fábricas estáticas (`create`) asegura que no existan entidades `Invoice` en estado inconsistente en memoria.
*   Evitar los métodos de fecha locales (`getFullYear()`, `getDate()`) en cálculos cronológicos exactos en favor de métodos UTC evita diferencias de fecha según la configuración regional de la máquina del desarrollador.

### Open questions
*   Ninguna.

### Next milestone
Implementar el Commit 005: Agregado de Operación (`Operation`) consolidando la agrupación de facturas y la fórmula de descuento comercial simple.
