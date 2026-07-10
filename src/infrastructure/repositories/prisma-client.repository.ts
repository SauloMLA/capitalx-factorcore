import { Injectable } from '@nestjs/common';
import { Client } from '../../domain/entities/client.entity';
import { TaxId } from '../../domain/common/value-objects/tax-id.value-object';
import { ClientRepository } from '../../domain/repositories/client.repository.interface';
import { PrismaService } from '../database/prisma.service';
import { ClientMapper } from '../mappers/client.mapper';

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(client: Client): Promise<void> {
    const data = ClientMapper.toPersistence(client);
    await this.prisma.clientRecord.upsert({
      where: { id: data.id },
      create: data,
      update: { name: data.name, email: data.email, status: data.status },
    });
  }

  async findById(id: string): Promise<Client | null> {
    const record = await this.prisma.clientRecord.findUnique({ where: { id } });
    if (!record) return null;
    return ClientMapper.toDomain(record);
  }

  async findByTaxId(taxId: TaxId): Promise<Client | null> {
    const record = await this.prisma.clientRecord.findUnique({
      where: { rfc: taxId.value },
    });
    if (!record) return null;
    return ClientMapper.toDomain(record);
  }
}
