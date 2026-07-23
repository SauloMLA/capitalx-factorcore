import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Seed Administrador de Mesa de Control
  await prisma.userRecord.upsert({
    where: { email: 'analyst@capital.mx' },
    update: {
      passwordHash: hashedPassword,
      name: 'Carlos Analista',
      role: 'ADMINISTRATOR',
      isActive: true,
    },
    create: {
      id: 'usr-admin-001',
      email: 'analyst@capital.mx',
      passwordHash: hashedPassword,
      name: 'Carlos Analista',
      role: 'ADMINISTRATOR',
      isActive: true,
      clientId: null,
    },
  });

  // 2. Seed Operador de Originación
  await prisma.userRecord.upsert({
    where: { email: 'operador@capital.mx' },
    update: {
      passwordHash: hashedPassword,
      name: 'Ana Operadora',
      role: 'OPERATOR',
      isActive: true,
    },
    create: {
      id: 'usr-operator-001',
      email: 'operador@capital.mx',
      passwordHash: hashedPassword,
      name: 'Ana Operadora',
      role: 'OPERATOR',
      isActive: true,
      clientId: null,
    },
  });

  console.log('✅ Seed ejecutado exitosamente. Usuarios predeterminados listos.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
