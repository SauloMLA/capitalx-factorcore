import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { execSync } from 'child_process';

// Force DATABASE_URL for testing if not set
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/factorcore_test';
}

import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/infrastructure/database/prisma.service';
import { HttpExceptionFilter } from './../src/infrastructure/http/filters/http-exception.filter';
import { REPOSITORY_TOKENS } from './../src/infrastructure/tokens/repository.tokens';
import { TokenService } from './../src/application/ports/token-service.interface';
import { UserRole } from './../src/domain/enums/user-role.enum';

describe('Factoring API Integration (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let operatorToken: string;

  beforeAll(async () => {
    try {
      execSync('npx prisma db push --skip-generate', {
        env: { ...process.env },
      });
    } catch {
      // If no PostgreSQL instance is running locally, tests fallback gracefully
    }

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

    const tokenService = app.get<TokenService>(REPOSITORY_TOKENS.TOKEN_SERVICE);
    adminToken = await tokenService.generateAccessToken({
      sub: 'admin-uuid-1',
      email: 'admin@capitalx.com',
      role: UserRole.ADMINISTRATOR,
      clientId: null,
    });
    operatorToken = await tokenService.generateAccessToken({
      sub: 'operator-uuid-1',
      email: 'operator@capitalx.com',
      role: UserRole.OPERATOR,
      clientId: null,
    });
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
    it('should register a client in pending status and allow ADMINISTRATOR to approve it', async () => {
      // 1. Register Client (Pending)
      const res = await request(app.getHttpServer())
        .post('/clientes')
        .send({
          rfc: 'XYZ850101XXX',
          name: 'Compañia ABC S.A.',
          email: 'contacto@abc.mx',
        })
        .expect(201);
      
      const clientId = res.body.id;

      // Verify in database
      const client = await prisma.clientRecord.findUnique({ where: { id: clientId } });
      expect(client).toBeDefined();
      expect(client?.status).toBe('PENDING');

      // 2. Approve Client with ADMINISTRATOR token
      await request(app.getHttpServer())
        .patch(`/clientes/${clientId}/aprobar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify status change in database
      const approvedClient = await prisma.clientRecord.findUnique({ where: { id: clientId } });
      expect(approvedClient?.status).toBe('APPROVED');
    });

    it('should reject approval from OPERATOR role (403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .post('/clientes')
        .send({
          rfc: 'OP850101XXX',
          name: 'Operator Test Client',
          email: 'op@client.com',
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/clientes/${res.body.id}/aprobar`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(403);
    });

    it('should reject approval from unauthenticated request (401 Unauthorized)', async () => {
      const res = await request(app.getHttpServer())
        .post('/clientes')
        .send({
          rfc: 'UNAUTH850101X',
          name: 'Unauth Client',
          email: 'unauth@client.com',
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/clientes/${res.body.id}/aprobar`)
        .expect(401);
    });

    it('should reject registration with invalid RFC format (400)', async () => {
      await request(app.getHttpServer())
        .post('/clientes')
        .send({
          rfc: 'INVALID-RFC',
          name: 'Company',
          email: 'test@company.com',
        })
        .expect(400);
    });

    it('should reject registration when RFC already exists (409)', async () => {
      const clientPayload = {
        rfc: 'DUP850101XXX',
        name: 'First Corp',
        email: 'first@corp.com',
      };

      await request(app.getHttpServer()).post('/clientes').send(clientPayload).expect(201);

      await request(app.getHttpServer())
        .post('/clientes')
        .send({
          ...clientPayload,
          name: 'Second',
        })
        .expect(409);
    });

    it('should reject approval of already approved client (422)', async () => {
      const res = await request(app.getHttpServer())
        .post('/clientes')
        .send({ rfc: 'WXY850101XXX', name: 'Corp', email: 'c@c.mx' });
      const clientId = res.body.id;

      await request(app.getHttpServer())
        .patch(`/clientes/${clientId}/aprobar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .patch(`/clientes/${clientId}/aprobar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(422);
    });
  });

  // ─── Operations Flow ────────────────────────────────────────────────────────

  describe('POST /operaciones & GET /clientes/:id/resumen', () => {
    let clientId: string;
    const requestDate = new Date('2026-07-10T12:00:00Z');

    beforeEach(async () => {
      // Create and approve client before operation tests
      const res = await request(app.getHttpServer())
        .post('/clientes')
        .send({ rfc: 'QWE850101XXX', name: 'Eligible Client', email: 'e@client.com' });
      clientId = res.body.id;
      await request(app.getHttpServer())
        .patch(`/clientes/${clientId}/aprobar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should create factoring operation and get accurate client summary metrics', async () => {
      const issueDate = new Date('2026-07-01T00:00:00Z');
      const dueDate = new Date('2026-08-10T00:00:00Z'); // 31 days remaining term

      // 1. Create factoring operation
      const res = await request(app.getHttpServer())
        .post('/operaciones')
        .send({
          clientId,
          requestDate,
          invoices: [
            {
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
      expect(res.body.operationId).toBeDefined();
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
      const issueDate = new Date('2026-07-01T00:00:00Z');
      const dueDate = new Date('2026-08-10T00:00:00Z');

      const operationPayload = {
        clientId,
        requestDate,
        invoices: [
          {
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
        .send(operationPayload)
        .expect(201);

      // Second financing operation using the same folio fails
      const errRes = await request(app.getHttpServer())
        .post('/operaciones')
        .send(operationPayload)
        .expect(422);

      expect(errRes.body.message).toContain('Operation validation failed');
      expect(errRes.body.errors).toBeDefined();
      expect(errRes.body.errors[0].folio).toBe('FOL-DUP');
    });
  });
});
