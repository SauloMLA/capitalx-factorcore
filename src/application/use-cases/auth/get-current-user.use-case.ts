import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { UserNotFoundException } from '../../exceptions/user.exceptions';
import { UserInactiveException } from '../../exceptions/auth.exceptions';

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  clientId: string | null;
  createdAt: Date;
}

/**
 * CASO DE USO: Obtener Usuario Autenticado (GetCurrentUserUseCase)
 * Capa: Aplicación (Application Layer)
 */
export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    if (!user.valueIsActive) {
      throw new UserInactiveException();
    }

    return {
      id: user.valueId,
      email: user.valueEmail.value,
      name: user.valueName,
      role: user.valueRole,
      isActive: user.valueIsActive,
      clientId: user.valueClientId,
      createdAt: user.valueCreatedAt,
    };
  }
}
