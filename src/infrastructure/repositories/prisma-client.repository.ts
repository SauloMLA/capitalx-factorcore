import { Injectable } from '@nestjs/common';
import { Client } from '../../domain/entities/client.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { PrismaService } from '../database/prisma.service';
import { ClientMapper } from '../mappers/client.mapper';

/**
 * REPOSITORIO CONCRETO DE CLIENTES (PRISMA)
 * Capa: Infraestructura (Infrastructure Layer)
 * 
 * ¿Qué responsabilidad tiene?
 * Implementar el contrato `ClientRepository` del dominio usando Prisma para interactuar con PostgreSQL.
 * Se encarga de hacer los inserts/updates físicos y de mapear los registros crudos de la base de datos
 * a entidades vivas del Dominio (y viceversa) usando el `ClientMapper`.
 */
@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Guarda un cliente en la base de datos (creación o actualización)
  async save(client: Client): Promise<void> {
    // 1. Traduce la entidad de dominio Client a un objeto plano compatible con las tablas de la BD
    const data = ClientMapper.toPersistence(client);
    
    // 2. Ejecuta un upsert (si ya existe por ID actualiza, si no existe lo crea)
    await this.prisma.clientRecord.upsert({
      where: { id: data.id },
      create: data,
      update: { name: data.name, email: data.email, status: data.status },
    });
  }

  // Busca un cliente por su ID y lo devuelve reconstituido
  async findById(id: string): Promise<Client | null> {
    const record = await this.prisma.clientRecord.findUnique({ where: { id } });
    if (!record) return null;
    
    // Convierte el registro crudo de la base de datos a un objeto rico de Dominio (reconstitute)
    return ClientMapper.toDomain(record);
  }

  // Busca un cliente por su RFC (TaxId) y lo devuelve reconstituido
  async findByTaxId(taxId: TaxId): Promise<Client | null> {
    const record = await this.prisma.clientRecord.findUnique({
      where: { rfc: taxId.value },
    });
    if (!record) return null;
    
    // Traduce e hidrata la información en una entidad Client en RAM
    return ClientMapper.toDomain(record);
  }
}
