# PROJECT_GUIDE

Esta es la única fuente de verdad técnica de las reglas de negocio para el desarrollo de **FactorCore**. Ningún desarrollador o agente de software puede asumir invariantes funcionales que no estén explícitamente documentadas aquí.

Para información sobre las decisiones de diseño, patrones utilizados o la justificación técnica, consulta el [README.md](README.md) y [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 1. Visión del Proyecto
**FactorCore** es un motor simplificado de originación financiera diseñado específicamente para gestionar operaciones de factoraje (factoring) corporativo bajo las reglas de negocio de **Capital X**.

El sistema permite a empresas registradas y aprobadas (Clientes) ceder sus derechos de cobro contenidos en facturas vigentes para obtener liquidez anticipada de forma rápida y segura.

---

## 2. Contexto del Negocio (Lenguaje Ubicuo)
El factoraje financiero en **FactorCore** se modela exactamente mediante dos flujos operativos clave:
1.  **Alta y Aprobación de Clientes:** Toda empresa proveedora (cliente) que desea anticipar facturas debe ser dada de alta y aprobada explícitamente en el sistema antes de poder originar cualquier operación financiera.
2.  **Originación de Operaciones:** El cliente cede una o más facturas válidas. La plataforma calcula el anticipo correspondiente aplicando un porcentaje de aforo fijo y cobrando una comisión fija por el servicio, depositando el monto neto resultante.

---

## 3. Reglas de Negocio (Invariantes Estrictas)

### Módulo de Clientes (Clients)
*   **RD-CLI-001 (Ciclo de Vida):** Todo cliente inicia en estado `PENDING`. Debe ser activado explícitamente al estado `APPROVED` para poder operar.
*   **RD-CLI-002 (Identidad Fiscal):** El identificador fiscal del cliente (RFC) debe ser estrictamente de **Persona Moral** en México (12 caracteres alfanuméricos con formato `[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}`).
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
    *   *Todos los montos monetarios se redondean exactamente a 2 decimales.*
