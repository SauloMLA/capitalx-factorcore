import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { execSync } from 'child_process';

// Force DATABASE_URL to test.db before anything loads Prisma Client
process.env.DATABASE_URL = 'file:./test.db';

import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/infrastructure/database/prisma.service';
import { HttpExceptionFilter } from './../src/infrastructure/http/filters/http-exception.filter';

describe('Factoring API Integration (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Programmatically push schema to SQLite test database to ensure it is created and aligned
    execSync('npx prisma db push --skip-generate', {
      env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Clear database records to ensure each test is isolated
    await prisma.invoiceRecord.deleteMany();
    await prisma.operationRecord.deleteMany();
    await prisma.clientRecord.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Clients Flow ───────────────────────────────────────────────────────────

  describe('POST /clientes & PATCH /clientes/:id/aprobar', () => {
    it('should register a client in pending status and then approve it', async () => {
      const clientId = '123e4567-e89b-42d3-8456-426614174001';

      // 1. Register Client (Pending)
      await request(app.getHttpServer())
        .post('/clientes')
        .send({
          id: clientId,
          rfc: 'XYZ850101XXX',
          name: 'Compañia ABC S.A.',
          email: 'contacto@abc.mx',
        })
        .expect(201);

      // Verify in database
      const client = await prisma.clientRecord.findUnique({ where: { id: clientId } });
      expect(client).toBeDefined();
      expect(client?.status).toBe('PENDING');

      // 2. Approve Client
      await request(app.getHttpServer())
        .patch(`/clientes/${clientId}/aprobar`)
        .expect(200);

      // Verify status change in database
      const approvedClient = await prisma.clientRecord.findUnique({ where: { id: clientId } });
      expect(approvedClient?.status).toBe('APPROVED');
    });

    it('should reject registration with invalid RFC format (400)', async () => {
      await request(app.getHttpServer())
        .post('/clientes')
        .send({
          id: '123e4567-e89b-42d3-8456-426614174002',
          rfc: 'INVALID-RFC',
          name: 'Company',
          email: 'test@company.com',
        })
        .expect(400);
    });

    it('should reject registration when RFC already exists (409)', async () => {
      const clientPayload = {
        id: '123e4567-e89b-42d3-8456-426614174003',
        rfc: 'XYZ850101XXX',
        name: 'First Corp',
        email: 'first@corp.com',
      };

      await request(app.getHttpServer()).post('/clientes').send(clientPayload).expect(201);

      await request(app.getHttpServer())
        .post('/clientes')
        .send({
          ...clientPayload,
          id: '123e4567-e89b-42d3-8456-426614174004',
        })
        .expect(409);
    });

    it('should reject approval of already approved client (422)', async () => {
      const clientId = '123e4567-e89b-42d3-8456-426614174005';
      await request(app.getHttpServer())
        .post('/clientes')
        .send({ id: clientId, rfc: 'XYZ850101XXX', name: 'Corp', email: 'c@c.mx' });

      await request(app.getHttpServer()).patch(`/clientes/${clientId}/aprobar`).expect(200);
      await request(app.getHttpServer()).patch(`/clientes/${clientId}/aprobar`).expect(422);
    });
  });

  // ─── Operations Flow ────────────────────────────────────────────────────────

  describe('POST /operaciones & GET /clientes/:id/resumen', () => {
    const clientId = '123e4567-e89b-42d3-8456-426614174006';
    const requestDate = new Date('2026-07-10T12:00:00Z');

    beforeEach(async () => {
      // Create and approve client before operation tests
      await request(app.getHttpServer())
        .post('/clientes')
        .send({ id: clientId, rfc: 'XYZ850101XXX', name: 'Eligible Client', email: 'e@client.com' });
      await request(app.getHttpServer()).patch(`/clientes/${clientId}/aprobar`).expect(200);
    });

    it('should create factoring operation and get accurate client summary metrics', async () => {
      const opId = '123e4567-e89b-42d3-8456-426614174008';
      const issueDate = new Date('2026-07-01T00:00:00Z');
      const dueDate = new Date('2026-08-10T00:00:00Z'); // 31 days remaining term

      // 1. Create factoring operation
      const res = await request(app.getHttpServer())
        .post('/operaciones')
        .send({
          operationId: opId,
          clientId,
          requestDate,
          invoices: [
            {
              id: '123e4567-e89b-42d3-8456-426614174009',
              folio: 'FOL-001',
              debtorRfc: 'DEF020202ABC',
              debtorName: 'Debtor S.A.',
              amount: 20000,
              issueDate,
              dueDate,
            },
          ],
        })
        .expect(201);

      // Verify response amounts
      expect(res.body.operationId).toBe(opId);
      expect(res.body.totalAmount).toBe(20000);
      expect(res.body.advancedAmount).toBe(17000); // 85%
      expect(res.body.commission).toBe(300); // 1.5%
      expect(res.body.depositAmount).toBe(16700); // 17000 - 300

      // 2. Fetch client summary and assert counts and calculations
      const summaryRes = await request(app.getHttpServer())
        .get(`/clientes/${clientId}/resumen`)
        .expect(200);

      expect(summaryRes.body.operationCount).toBe(1);
      expect(summaryRes.body.totalAdvancedAmount).toBe(17000);
      expect(new Date(summaryRes.body.nearestDueDate).getTime()).toBe(dueDate.getTime());
    });

    it('should reject operation if invoice folio is already financed (422)', async () => {
      const opId1 = '123e4567-e89b-42d3-8456-426614174011';
      const opId2 = '123e4567-e89b-42d3-8456-426614174012';
      const issueDate = new Date('2026-07-01T00:00:00Z');
      const dueDate = new Date('2026-08-10T00:00:00Z');

      const operationPayload = {
        clientId,
        requestDate,
        invoices: [
          {
            id: '123e4567-e89b-42d3-8456-426614174013',
            folio: 'FOL-DUP',
            debtorRfc: 'DEF020202ABC',
            debtorName: 'Debtor',
            amount: 5000,
            issueDate,
            dueDate,
          },
        ],
      };

      // First financing operation succeeds
      await request(app.getHttpServer())
        .post('/operaciones')
        .send({ ...operationPayload, operationId: opId1 })
        .expect(201);

      // Second financing operation using the same folio fails
      const errRes = await request(app.getHttpServer())
        .post('/operaciones')
        .send({
          ...operationPayload,
          operationId: opId2,
          invoices: [{ ...operationPayload.invoices[0], id: '123e4567-e89b-42d3-8456-426614174014' }],
        })
        .expect(422);

      expect(errRes.body.message).toContain('Operation validation failed');
      expect(errRes.body.errors).toBeDefined();
      expect(errRes.body.errors[0].folio).toBe('FOL-DUP');
    });
  });
});
