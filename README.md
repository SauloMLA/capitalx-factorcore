# FactorCore

> *Durante este reto intenté acercarme más a cómo desarrollaría un servicio en una Fintech que a simplemente resolver cuatro endpoints.*

**FactorCore** es un motor de originación financiera construido para el reto de Capital X. El diseño de este sistema prioriza el aislamiento estricto de las reglas de negocio y la protección de las invariantes por encima de las abstracciones tecnológicas.

---

## 🧠 Understanding the Problem

Al leer los requerimientos, quedó claro que **esto no era un CRUD**. Una API de factoraje no se trata simplemente de guardar datos en tablas, sino de proteger un estado financiero consistente. 

Las reglas críticas que dictaron el diseño fueron:
*   Los clientes deben estar explícitamente aprobados antes de poder solicitar liquidez.
*   Las facturas tienen vigencias estrictas (15 a 120 días calendario).
*   Se debe prevenir, transaccionalmente, el doble financiamiento de una misma factura.
*   El cálculo del aforo (85%) y la comisión (1.5%) deben ser atómicos.

### Domain First
Debido a la naturaleza crítica de estas invariantes, decidí modelar el dominio antes de escribir un solo controlador, configurar NestJS o diseñar la base de datos en Prisma. 

Primero identifiqué cuáles eran las reglas que realmente daban valor al sistema (Agregados, Entidades y Objetos de Valor). Una vez aisladas, probadas y aseguradas esas reglas en TypeScript puro, el resto de la aplicación (bases de datos, controladores, frameworks) se convirtió simplemente en infraestructura alrededor del dominio.

---

## 🏗 Design Decisions

*   **¿Por qué Domain-Driven Design (DDD)?** En una Fintech los frameworks y las bases de datos cambian, pero las reglas del dinero no. Aislar el negocio asegura que la validación de montos o cálculo de comisiones nunca se acople a un Request HTTP.
*   **¿Por qué Clean Architecture?** Para que el caso de uso se lea como un flujo de negocio puro y la persistencia sea un detalle intercambiable. Esto facilitó escribir pruebas unitarias que validan la originación en milisegundos.
*   **¿Por qué Aggregate Roots?** Un lote de facturas financiado (`Operation`) tiene invariantes atómicas conjuntas. El Aggregate actúa como frontera transaccional garantizando que la operación se aprueba por completo o falla por completo.
*   **¿Por qué Value Objects?** Un RFC no es un simple `string`; tiene reglas (12 caracteres). Al encapsularlos, evitamos validaciones condicionales dispersas en los controladores y garantizamos consistencia desde el constructor.
*   **¿Por qué NestJS para un proyecto tan pequeño?** Aunque Express hubiese bastado, NestJS provee una Inyección de Dependencias (DI) robusta de caja y módulos predecibles. Esto me permitió conectar las interfaces del dominio con la infraestructura de Prisma de forma muy elegante usando *Factory Providers*.

---

## ⚖️ Trade-offs

En ingeniería de software no hay decisiones perfectas. Estas son las restricciones que asumí conscientemente para este reto:

*   **SQLite (en lugar de PostgreSQL):** No porque sea la mejor base de datos para producción (carece de row-level locks robustos), sino porque mejora muchísimo la experiencia del evaluador. Permite clonar, instalar y correr el proyecto completo en 30 segundos sin necesidad de configurar contenedores Docker. La arquitectura limpia garantiza que migrar a PostgreSQL solo requeriría escribir un nuevo adapter.
*   **Prisma ORM:** Seleccionado para generar un esquema de base de datos rápido y seguro con tipos estáticos fuertes. Delegué el control transaccional ACID (`$transaction`) al adapter de Prisma para simplificar los Use Cases.
*   **Mappers manuales:** Convertir modelos de Prisma a Entidades de Dominio toma tiempo y genera código adicional (*boilerplate*). Asumí este costo intencionalmente para garantizar que el modelo de dominio permanezca 100% puro y ajeno a cambios en las tablas de la base de datos.

---

## 🤖 Uso de IA como Herramienta de Ingeniería

Utilicé un flujo de desarrollo asistido por IA mediante un orquestador (Antigravity/Gemini) para acelerar tareas repetitivas, mantener contexto técnico entre iteraciones y explorar alternativas de implementación.

Las decisiones de arquitectura, el modelo de dominio, los trade-offs y las reglas de negocio fueron iteradas y refinadas manualmente antes de incorporarse al proyecto. La IA actuó estrictamente como un acelerador de productividad; las decisiones finales y el diseño del sistema permanecieron en todo momento bajo criterio de ingeniería.

---

## 🚀 Evaluating the API

El flujo completo del negocio puede probarse localmente en menos de dos minutos siguiendo estos pasos.

### 1. Iniciar la aplicación

```bash
cp .env.example .env
npm install
npm run db:setup
npm run start:dev
```

Abre **[http://localhost:3000/api](http://localhost:3000/api)** para ver y utilizar la documentación interactiva Swagger. Alternativamente, puedes usar `curl` desde la consola:

### 2. Flujo E2E desde consola

**A) Registrar un Cliente**
```bash
curl -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "rfc": "CAP220101XYZ",
    "name": "Capital Partner S.A.",
    "email": "partner@capital.mx"
  }'
```
*(Copia el `id` devuelto para el siguiente paso)*

**B) Aprobar al Cliente**
```bash
# Reemplaza <CLIENT_ID> con el UUID devuelto en el paso anterior
curl -X PATCH http://localhost:3000/clientes/<CLIENT_ID>/aprobar
```

**C) Crear una Operación (Financiar Facturas)**
```bash
curl -X POST http://localhost:3000/operaciones \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "<CLIENT_ID>",
    "requestDate": "2026-07-13T12:00:00Z",
    "invoices": [
      {
        "folio": "FAC-001",
        "debtorRfc": "DEF020202ABC",
        "debtorName": "Distribuidora Nacional S.A.",
        "amount": 250000.50,
        "issueDate": "2026-07-01T00:00:00Z",
        "dueDate": "2026-08-30T00:00:00Z"
      }
    ]
  }'
```

---

## 📚 Documentación Técnica

*   **[ARCHITECTURE.md](ARCHITECTURE.md):** Diagrama detallado de las capas, flujo de datos, modelo de dominio y justificación técnica de los Agregados.
*   **[PROJECT_GUIDE.md](PROJECT_GUIDE.md):** Fuente de verdad del producto. Contiene el lenguaje ubicuo y las invariantes de negocio explícitas de la API.

---

## 🔮 If I had more time...

Si este fuese un servicio en camino a producción y no una prueba técnica acotada, estas serían las siguientes áreas de mejora estructural:

*   **PostgreSQL & Docker Compose:** Migrar de SQLite a un motor robusto preparado para alta concurrencia y despliegue inmutable con contenedores.
*   **Optimistic Locking:** Implementar un campo `version` en las entidades de base de datos para prevenir condiciones de carrera al actualizar estados de clientes o aprobar facturas simultáneamente.
*   **CI/CD Pipeline:** Acciones de GitHub automatizadas ejecutando linters, test suites, cobertura y construcción de imágenes Docker en cada PR.
*   **Observabilidad & Health Checks:** Integración con Prometheus/Grafana y endpoints nativos (`/health`) para monitoreo de uptime y uso de CPU/RAM de NestJS.
*   **Rate Limiting & API Keys:** Asegurar los endpoints públicos para prevenir abuso de peticiones mediante políticas HTTP 429 (Too Many Requests).
*   **Caché Distribuida (Redis):** Cachear el endpoint `GET /clientes/:id/resumen` para consultas concurrentes pesadas, invalidando la caché sólo tras originar una nueva operación.
