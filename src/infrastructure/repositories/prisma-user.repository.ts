import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/common/value-objects/email.value-object';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { PrismaService } from '../database/prisma.service';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);

    await this.prisma.userRecord.upsert({
      where: { id: data.id },
      create: data,
      update: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role,
        isActive: data.isActive,
        clientId: data.clientId,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.userRecord.findUnique({ where: { id } });
    if (!record) return null;
    return UserMapper.toDomain(record);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.userRecord.findUnique({
      where: { email: email.value },
    });
    if (!record) return null;
    return UserMapper.toDomain(record);
  }

  async findAll(): Promise<User[]> {
    const records = await this.prisma.userRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map(UserMapper.toDomain);
  }
}
