# FactorCore 2.0

> **FactorCore 2.0** es un motor de originación financiera corporativo construido con **Clean Architecture** y **Domain-Driven Design (DDD)** para la plataforma de factoraje de **Capital X**.

---

## 🧠 Visión del Sistema

**FactorCore** gestiona el ciclo de vida completo del factoraje financiero (factoring) corporativo:
1. **Gestión y Aprobación de Clientes**: Registro estricto con validaciones RFC de Persona Moral y mesa de control para aprobación explícita.
2. **Originación de Operaciones**: Cesión de facturas en lote con cálculo de aforo fijo (85%), comisión (1.5%) y prevención transaccional de doble financiamiento.
3. **Autenticación & RBAC**: Autenticación segura con JWT, Refresh Tokens en cookies `HttpOnly` y control de acceso basado en roles (`ADMINISTRATOR` y `OPERATOR`).
4. **Dashboard & Métricas Ejecutivo**: Métricas en tiempo real, KPIs consolidados y análisis mensual de volumen y comisiones.
5. **Bitácora de Auditoría Inmutable**: Registro de todas las acciones del sistema (`CREATE`, `APPROVE`, etc.) capturando el usuario, IP, User Agent y deltas de cambios (`oldValue` / `newValue`).
6. **Centro de Notificaciones**: Emisión y consulta de alertas del sistema para la mesa de control y usuarios.

---

## 🏗 Decisiones Arquitectónicas (Clean Architecture)

- **Domain-Driven Design (DDD)**: El núcleo de negocio (`src/domain/`) se mantiene 100% puro en TypeScript, libre de dependencias de frameworks o bases de datos.
- **Clean Architecture**: Flujo unidireccional `HTTP Controller → Use Case → Domain Aggregate → Repository Interface → Prisma Adapter`.
- **PostgreSQL & Prisma ORM**: Persistencia relacional atómica con soporte para migraciones automáticas.
- **NestJS**: Framework modular con inyección de dependencias por interfaces/tokens (`REPOSITORY_TOKENS`).

---

## 🚀 Inicio Rápido

### 1. Requisitos Previos
- Node.js v20+
- PostgreSQL activo en `localhost:5432` (o vía Docker Desktop / Docker Compose)

### 2. Instalación y Configuración

```bash
cd financial-api
cp .env.example .env
npm install

# Aplicar migraciones e inicializar cliente Prisma
npm run db:setup

# Sembrar usuarios por defecto (Admin: admin@factorcore.com)
npm run db:seed

# Iniciar backend en desarrollo (NestJS en http://localhost:3005)
npm run start:dev
```

### 3. Swagger & Documentación Interactiva
Abre **[http://localhost:3005/api](http://localhost:3005/api)** para consultar y probar todos los endpoints REST interactivos.

---

## 🧪 Pruebas Unitarias
El proyecto cuenta con 100% de cobertura en casos de uso y entidades de dominio:

```bash
# Ejecutar todas las suites de prueba (39 suites / 143 tests)
npm test
```

---

## 📚 Documentación Adicional

* **[ARCHITECTURE.md](ARCHITECTURE.md)**: Diagramas de Agregados, flujo de datos y decisiones de diseño.
* **[PROJECT_GUIDE.md](PROJECT_GUIDE.md)**: Invariantes y reglas de negocio del sistema.
