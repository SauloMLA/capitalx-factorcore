import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../application/ports/password-hasher.interface';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly rounds = 10;

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.rounds);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
