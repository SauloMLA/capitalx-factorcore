import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

/**
 * CASO DE USO: Listar Clientes
 * Capa: Aplicación
 *
 * Retorna todos los clientes registrados ordenados por fecha de creación descendente.
 * Utilizado por el dashboard de la mesa de control para mostrar el portafolio de clientes.
 */
@Injectable()
export class GetClientListUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const clients = await this.prisma.clientRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return clients.map(client => ({
      id: client.id,
      rfc: client.rfc,
      name: client.name,
      email: client.email,
      status: client.status,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    }));
  }
}
