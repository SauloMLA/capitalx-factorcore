import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const operatorPasswordHash = await bcrypt.hash('password123', 10);

  console.log('🌱 Sembrando datos de prueba en la base de datos...');

  // 1. Limpiar o asegurar Usuarios
  let adminUser = await prisma.userRecord.findFirst({ where: { email: 'admin@factorcore.com' } });
  if (!adminUser) {
    adminUser = await prisma.userRecord.create({
      data: {
        id: `usr-admin-${Date.now()}`,
        email: 'admin@factorcore.com',
        passwordHash: adminPasswordHash,
        name: 'Carlos Analista',
        role: 'ADMINISTRATOR',
        isActive: true,
      },
    });
  } else {
    adminUser = await prisma.userRecord.update({
      where: { id: adminUser.id },
      data: { passwordHash: adminPasswordHash, name: 'Carlos Analista', role: 'ADMINISTRATOR' },
    });
  }

  let operatorUser = await prisma.userRecord.findFirst({ where: { email: 'operador@capital.mx' } });
  if (!operatorUser) {
    operatorUser = await prisma.userRecord.create({
      data: {
        id: `usr-operator-${Date.now()}`,
        email: 'operador@capital.mx',
        passwordHash: operatorPasswordHash,
        name: 'Ana Operadora',
        role: 'OPERATOR',
        isActive: true,
      },
    });
  } else {
    operatorUser = await prisma.userRecord.update({
      where: { id: operatorUser.id },
      data: { passwordHash: operatorPasswordHash, name: 'Ana Operadora', role: 'OPERATOR' },
    });
  }

  // 2. Clientes (Empresas)
  const clientsData = [
    {
      id: 'cli-001',
      rfc: 'LTN1803157A8',
      name: 'Logística & Transportes del Norte S.A. de C.V.',
      email: 'contacto@ltnorte.com.mx',
      status: 'APPROVED',
      createdAt: new Date('2026-01-15T10:00:00Z'),
    },
    {
      id: 'cli-002',
      rfc: 'CIA1209048K2',
      name: 'Comercializadora Industrial Alfa S.A.P.I. de C.V.',
      email: 'finanzas@grupoalfa.mx',
      status: 'APPROVED',
      createdAt: new Date('2026-02-01T11:30:00Z'),
    },
    {
      id: 'cli-003',
      rfc: 'STP1905203M4',
      name: 'Soluciones Tecnológicas del Pacífico S.A. de C.V.',
      email: 'tesoreria@solutecpacifico.com',
      status: 'APPROVED',
      createdAt: new Date('2026-03-10T14:15:00Z'),
    },
    {
      id: 'cli-004',
      rfc: 'TMB1511109P1',
      name: 'Textiles y Manufacturas del Bajío S.A. de C.V.',
      email: 'facturacion@texbajio.com.mx',
      status: 'APPROVED',
      createdAt: new Date('2026-04-05T09:45:00Z'),
    },
    {
      id: 'cli-005',
      rfc: 'IDR2102025R9',
      name: 'Importaciones & Distribución Regiomontana S.A. de C.V.',
      email: 'cuentasporcobrar@idregio.com',
      status: 'PENDING',
      createdAt: new Date('2026-07-20T16:20:00Z'),
    },
    {
      id: 'cli-006',
      rfc: 'AVS2208184T3',
      name: 'Agroindustrias del Valle de Sinaloa S.A. de C.V.',
      email: 'administracion@agrovalle.mx',
      status: 'PENDING',
      createdAt: new Date('2026-07-24T18:00:00Z'),
    },
  ];

  for (const client of clientsData) {
    await prisma.clientRecord.upsert({
      where: { id: client.id },
      update: client,
      create: client,
    });
  }

  // 3. Operaciones de Factoraje y Facturas
  const operationsData = [
    {
      id: 'op-001',
      clientId: 'cli-001',
      totalAmount: 1250000.0,
      advancedAmount: 1062500.0,
      commission: 25000.0,
      depositAmount: 1037500.0,
      createdAt: new Date('2026-05-10T12:00:00Z'),
      invoices: [
        {
          id: 'inv-001',
          folio: 'FOL-2026-101',
          debtorRfc: 'WAL8902034K2',
          debtorName: 'Walmart de México S.A.B. de C.V.',
          amount: 750000.0,
          issueDate: new Date('2026-05-01T00:00:00Z'),
          dueDate: new Date('2026-08-01T00:00:00Z'),
        },
        {
          id: 'inv-002',
          folio: 'FOL-2026-102',
          debtorRfc: 'BAM9304128N1',
          debtorName: 'Grupo Bimbo S.A.B. de C.V.',
          amount: 500000.0,
          issueDate: new Date('2026-05-02T00:00:00Z'),
          dueDate: new Date('2026-08-02T00:00:00Z'),
        },
      ],
    },
    {
      id: 'op-002',
      clientId: 'cli-002',
      totalAmount: 880000.0,
      advancedAmount: 748000.0,
      commission: 17600.0,
      depositAmount: 730400.0,
      createdAt: new Date('2026-06-04T15:30:00Z'),
      invoices: [
        {
          id: 'inv-003',
          folio: 'FOL-2026-201',
          debtorRfc: 'FCO0207185L9',
          debtorName: 'Femsa Comercio S.A. de C.V. (OXXO)',
          amount: 880000.0,
          issueDate: new Date('2026-05-20T00:00:00Z'),
          dueDate: new Date('2026-08-20T00:00:00Z'),
        },
      ],
    },
    {
      id: 'op-003',
      clientId: 'cli-003',
      totalAmount: 2100000.0,
      advancedAmount: 1785000.0,
      commission: 42000.0,
      depositAmount: 1743000.0,
      createdAt: new Date('2026-06-25T11:10:00Z'),
      invoices: [
        {
          id: 'inv-004',
          folio: 'FOL-2026-301',
          debtorRfc: 'TSO9910048R3',
          debtorName: 'Tiendas Soriana S.A. de C.V.',
          amount: 1100000.0,
          issueDate: new Date('2026-06-15T00:00:00Z'),
          dueDate: new Date('2026-09-15T00:00:00Z'),
        },
        {
          id: 'inv-005',
          folio: 'FOL-2026-302',
          debtorRfc: 'CME9107223P7',
          debtorName: 'Chedraui Comercial S.A. de C.V.',
          amount: 1000000.0,
          issueDate: new Date('2026-06-18T00:00:00Z'),
          dueDate: new Date('2026-09-18T00:00:00Z'),
        },
      ],
    },
    {
      id: 'op-004',
      clientId: 'cli-004',
      totalAmount: 640000.0,
      advancedAmount: 544000.0,
      commission: 12800.0,
      depositAmount: 531200.0,
      createdAt: new Date('2026-07-12T17:45:00Z'),
      invoices: [
        {
          id: 'inv-006',
          folio: 'FOL-2026-401',
          debtorRfc: 'AME8809121K4',
          debtorName: 'Coppel S.A. de C.V.',
          amount: 640000.0,
          issueDate: new Date('2026-07-01T00:00:00Z'),
          dueDate: new Date('2026-10-01T00:00:00Z'),
        },
      ],
    },
  ];

  for (const op of operationsData) {
    const { invoices, ...opData } = op;
    await prisma.operationRecord.upsert({
      where: { id: op.id },
      update: opData,
      create: opData,
    });

    for (const inv of invoices) {
      await prisma.invoiceRecord.upsert({
        where: { id: inv.id },
        update: { ...inv, operationId: op.id },
        create: { ...inv, operationId: op.id },
      });
    }
  }

  // 4. Bitácora de Auditoría (Audit Logs)
  const auditLogsData = [
    {
      id: 'aud-001',
      entity: 'ClientRecord',
      entityId: 'cli-001',
      action: 'REGISTER_CLIENT',
      performedBy: adminUser.id,
      oldValue: null,
      newValue: JSON.stringify({ rfc: 'LTN1803157A8', name: 'Logística & Transportes del Norte S.A. de C.V.', status: 'PENDING' }),
      ip: '189.203.112.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0.0.0',
      timestamp: new Date('2026-01-15T10:00:00Z'),
    },
    {
      id: 'aud-002',
      entity: 'ClientRecord',
      entityId: 'cli-001',
      action: 'APPROVE_CLIENT',
      performedBy: adminUser.id,
      oldValue: JSON.stringify({ status: 'PENDING' }),
      newValue: JSON.stringify({ status: 'APPROVED' }),
      ip: '189.203.112.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0.0.0',
      timestamp: new Date('2026-01-15T10:05:00Z'),
    },
    {
      id: 'aud-003',
      entity: 'ClientRecord',
      entityId: 'cli-002',
      action: 'APPROVE_CLIENT',
      performedBy: adminUser.id,
      oldValue: JSON.stringify({ status: 'PENDING' }),
      newValue: JSON.stringify({ status: 'APPROVED' }),
      ip: '201.141.88.19',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0',
      timestamp: new Date('2026-02-01T11:30:00Z'),
    },
    {
      id: 'aud-004',
      entity: 'OperationRecord',
      entityId: 'op-001',
      action: 'CREATE_OPERATION',
      performedBy: operatorUser.id,
      oldValue: null,
      newValue: JSON.stringify({ clientId: 'cli-001', totalAmount: 1250000.0, advancedAmount: 1062500.0, commission: 25000.0 }),
      ip: '187.189.44.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
      timestamp: new Date('2026-05-10T12:00:00Z'),
    },
    {
      id: 'aud-005',
      entity: 'OperationRecord',
      entityId: 'op-002',
      action: 'CREATE_OPERATION',
      performedBy: operatorUser.id,
      oldValue: null,
      newValue: JSON.stringify({ clientId: 'cli-002', totalAmount: 880000.0, advancedAmount: 748000.0, commission: 17600.0 }),
      ip: '187.189.44.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
      timestamp: new Date('2026-06-04T15:30:00Z'),
    },
    {
      id: 'aud-006',
      entity: 'OperationRecord',
      entityId: 'op-003',
      action: 'CREATE_OPERATION',
      performedBy: operatorUser.id,
      oldValue: null,
      newValue: JSON.stringify({ clientId: 'cli-003', totalAmount: 2100000.0, advancedAmount: 1785000.0, commission: 42000.0 }),
      ip: '187.189.44.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
      timestamp: new Date('2026-06-25T11:10:00Z'),
    },
    {
      id: 'aud-007',
      entity: 'UserRecord',
      entityId: operatorUser.id,
      action: 'LOGIN',
      performedBy: operatorUser.id,
      oldValue: null,
      newValue: JSON.stringify({ status: 'SUCCESS_JWT_ISSUED' }),
      ip: '187.189.44.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
      timestamp: new Date('2026-07-24T09:12:00Z'),
    },
    {
      id: 'aud-008',
      entity: 'ClientRecord',
      entityId: 'cli-005',
      action: 'REGISTER_CLIENT',
      performedBy: operatorUser.id,
      oldValue: null,
      newValue: JSON.stringify({ rfc: 'IDR2102025R9', name: 'Importaciones & Distribución Regiomontana S.A. de C.V.', status: 'PENDING' }),
      ip: '187.189.44.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
      timestamp: new Date('2026-07-20T16:20:00Z'),
    },
    {
      id: 'aud-009',
      entity: 'ClientRecord',
      entityId: 'cli-006',
      action: 'REGISTER_CLIENT',
      performedBy: operatorUser.id,
      oldValue: null,
      newValue: JSON.stringify({ rfc: 'AVS2208184T3', name: 'Agroindustrias del Valle de Sinaloa S.A. de C.V.', status: 'PENDING' }),
      ip: '187.189.44.102',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
      timestamp: new Date('2026-07-24T18:00:00Z'),
    },
  ];

  for (const log of auditLogsData) {
    await prisma.auditLogRecord.upsert({
      where: { id: log.id },
      update: log,
      create: log,
    });
  }

  // 5. Notificaciones
  const notificationsData = [
    {
      id: 'not-001',
      userId: null,
      title: 'Nueva Operación Originada',
      message: 'Se originó una operación de $2,100,000.00 MXN para Soluciones Tecnológicas del Pacífico.',
      type: 'SUCCESS',
      isRead: false,
      createdAt: new Date('2026-06-25T11:10:00Z'),
    },
    {
      id: 'not-002',
      userId: null,
      title: 'Cliente Registrado en Espera de Aprobación',
      message: 'Importaciones & Distribución Regiomontana requiere revisión de expediente RFC: IDR2102025R9.',
      type: 'WARNING',
      isRead: false,
      createdAt: new Date('2026-07-20T16:20:00Z'),
    },
    {
      id: 'not-003',
      userId: null,
      title: 'Sistema Actualizado',
      message: 'FactorCore v2.0 - Motor de Reglas de Negocio en Producción.',
      type: 'INFO',
      isRead: true,
      createdAt: new Date('2026-07-25T08:00:00Z'),
    },
  ];

  for (const notif of notificationsData) {
    await prisma.notificationRecord.upsert({
      where: { id: notif.id },
      update: notif,
      create: notif,
    });
  }

  console.log('✅ Seed ejecutado exitosamente. Todos los datos de prueba listos.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
