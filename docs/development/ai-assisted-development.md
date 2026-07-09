# AI-Assisted Development

Este documento describe de manera transparente el uso de herramientas de Inteligencia Artificial en el desarrollo de **FactorCore**.

---

## Estrategia de Trabajo

1.  **Acelerador de Productividad:** La IA se utiliza para generar plantillas de código repetitivas, esquemas de prueba unitaria base y borradores de documentación técnica.
2.  **Validación Manual Obligatoria:** Ningún bloque de código ni decisión de diseño es aceptado directamente del modelo. Todo pasa por revisión, refactorización y validación manual bajo criterio de ingeniería antes de ser incorporado en un commit.
3.  **Registro de Decisiones:** Las decisiones finales tomadas durante el desarrollo quedan documentadas en los ADRs y en el archivo [development-decisions.md](file:///Users/sauloalaniz/Documents/financial-api/docs/development/development-decisions.md).

---

## Herramientas Utilizadas
*   **Asistencia:** Gemini (a través del entorno de desarrollo integrado Antigravity).
*   **Alcance:** Modelado del dominio conceptual, estructuración de directorios y generación de casos de prueba.
