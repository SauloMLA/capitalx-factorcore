# Domain-Driven Design (DDD)

## 1. Domain Modeling and Ubiquitous Language
FactorCore models credit checks, discount calculations, and invoice validation using business terms defined in the Ubiquitous Language (e.g., Issuer, Debtor, Invoice, Financing Request).

## 2. Core Abstractions
1.  **Aggregates & Root (Aggregate Root):**
    *   `Debtor`: Protects credit exposure. The balance properties (`usedCredit` and `creditLimit`) are kept private and modified only via domain methods like `consumeCredit()` and `releaseCredit()` to maintain domain invariants.
    *   `FinancingRequest`: Groups invoices of the same issuer/debtor to calculate commercial discounts.
2.  **Value Objects:**
    *   Inmutable objects (`Money`, `Percentage`, `TaxId`, `InvoiceFolio`). Format validations (like Tax ID regex) are executed at construction, preventing corrupt data from entering the domain.
3.  **Domain Services:**
    *   `DiscountCalculatorService`: Computes simple commercial discount formulas.
    *   `CreditAssessmentService`: Validates credit limits and risks.
