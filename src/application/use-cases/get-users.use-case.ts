import { Inject, Injectable } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories/user.repository.interface';
import { UserRole } from '../../domain/enums/user-role.enum';

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  clientId: string | null;
  createdAt: Date;
}

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    
    // Mapeamos a DTO para evitar exponer el passwordHash
    return users.map((user) => ({
      id: user.valueId,
      email: user.valueEmail.value,
      name: user.valueName,
      role: user.valueRole,
      isActive: user.valueIsActive,
      clientId: user.valueClientId || null,
      createdAt: user.valueCreatedAt,
    }));
  }
}
