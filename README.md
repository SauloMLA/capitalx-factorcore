# FactorCore 2.0 (Backend Engine)

> **FactorCore** es una plataforma de originación de factoraje financiero corporativo desarrollada para demostrar la construcción de un sistema empresarial resiliente utilizando **Clean Architecture**, **Domain-Driven Design (DDD)** y principios **SOLID**.

---

## 🧠 El Problema del Negocio

Las empresas proveedoras en América Latina enfrentan brechas críticas de flujo de caja al vender a grandes corporativos bajo términos de crédito comercial de **30 a 120 días**. Durante este plazo, su capital de trabajo permanece paralizado.

**FactorCore** resuelve esta fricción permitiendo a empresas aprobadas ceder sus derechos de cobro comerciales para obtener liquidez inmediata, mientras automatiza las validaciones fiscales, previene el doble financiamiento y mantiene trazabilidad total mediante auditoría inmutable.

---

## 🔄 Flujo Operativo y de Casos de Uso

$$\text{Registrar Cliente} \longrightarrow \text{Aprobar Cliente} \longrightarrow \text{Registrar Operación} \longrightarrow \text{Calcular Comisión} \longrightarrow \text{Generar Auditoría} \longrightarrow \text{Notificar}$$

1. **Registrar Cliente**: Validación sintáctica del RFC de Persona Moral (12 caracteres). Estado inicial `PENDING`.
2. **Aprobar Cliente**: Activación del cliente por un analista de Mesa de Control (`ADMINISTRATOR`).
3. **Registrar Operación**: Originación en lote validando elegibilidad de facturas (15-120 días).
4. **Calcular Comisión**: Aforo atómico del 85% y comisión del 1.5%.
5. **Generar Auditoría**: Registro inalterable en `audit_logs` con deltas `oldValue`/`newValue`, IP y UserAgent.
6. **Notificar**: Despacho de alerta en tiempo real a la Mesa de Control.

---

## 🎯 Bounded Contexts (Arquitectura DDD)

El sistema está formalmente desacoplado en dominios delimitados:
- **Auth Context**: Credenciales, Bcrypt (cost 10), JWT Access Tokens (15 min) y Refresh Tokens en cookies `HttpOnly`.
- **Client Context**: Identidad fiscal, invariantes de aprobación y RFC Persona Moral.
- **Operation Context**: Agregado `Operation`, entidad `Invoice`, cálculos de aforo y prevención de doble financiamiento.
- **Audit & Notification Context**: Trazabilidad e historial de eventos inalterables.

---

## 🔒 Cadena de Seguridad (Defense in Depth)

$$\text{JWT} \longrightarrow \text{Refresh Token (HttpOnly)} \longrightarrow \text{RBAC} \longrightarrow \text{Bcrypt} \longrightarrow \text{DTO Validation} \longrightarrow \text{Rate Limit} \longrightarrow \text{Helmet} \longrightarrow \text{CORS}$$

---

## 🚀 Inicio Rápido

```bash
cd financial-api
cp .env.example .env
npm install
npm run db:setup
npm run db:seed
npm run start:dev
```

Documentación interactiva Swagger: **[http://localhost:3005/api](http://localhost:3005/api)**

### Pruebas Unitarias
```bash
# 39 Test Suites / 143 Tests pasados al 100%
npm test
```

---

## 📚 Documentación Maestra de Diseño de Sistema

Para consultar las **Decisiones Arquitectónicas (ADRs)**, estrategias de **Performance & Indexación en PostgreSQL**, **Observabilidad (`/health`)** y el **Roadmap Evolutivo (V1 a V5)**, revisa el documento principal:

👉 **[TECHNICAL_DESIGN_DOCUMENT.md](TECHNICAL_DESIGN_DOCUMENT.md)**
