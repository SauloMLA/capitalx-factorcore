# Persistence with SQLite

## 1. Database as an Implementation Detail
The application core uses repository interfaces. The real data access is handled by adapters (using SQLite and Prisma ORM) located in the infrastructure layer. 

## 2. Technical Advantages
1.  **Zero Configuration:** Runs as a simple local file, making development and testing setups fast and simple.
2.  **ACID compliance:** Fully supports transactions and foreign keys constraints to ensure data integrity.
3.  **Portability:** Ideal for integrated testing using in-memory databases (`:memory:`) or transient files.

## 3. Migration Path
If the project needs to scale to a corporate database system (like PostgreSQL) in production, the migration is limited to modifying the database connector in the Prisma configuration schema. The domain and application layers remain completely untouched.
