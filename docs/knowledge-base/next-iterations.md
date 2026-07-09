# Next Iterations

This document details the planned next iterations and extensions for **FactorCore**, demonstrating product growth and architectural scalability:

---

## 1. Confirming (Reverse Factoring)
*   **Concept:** Allow Debtors (corporate clients) to initiate payment requests for their suppliers (Issuers) using their pre-approved credit lines.
*   **Impact:** Requires adding a new Aggregate Root (`ConfirmingRequest`), reusing the existing `Debtor` and `Invoice` core models without changing current business rules.

---

## 2. Event-Driven Architecture (EDA)
*   **Concept:** Publish domain events (`FinancingRequestApproved`, `InvoicePaid`) to an external broker (RabbitMQ or Kafka) for asynchronous integrations with accounting systems or notifications services.

---

## 3. Multi-Currency Support
*   **Concept:** Allow originations in USD, EUR, and other local currencies.
*   **Impact:** Expand the `Money` Value Object to store a currency code and delegate conversion rates calculations to a domain service.
