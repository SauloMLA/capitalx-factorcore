/**
 * Repository Injection Tokens
 *
 * Defined as Symbols to guarantee uniqueness at runtime and eliminate the risk
 * of string-literal collisions across NestJS modules.
 *
 * Usage in a module provider:
 *   { provide: REPOSITORY_TOKENS.CLIENT, useClass: PrismaClientRepository }
 *
 * Usage in a constructor:
 *   constructor(@Inject(REPOSITORY_TOKENS.CLIENT) private readonly repo: ClientRepository) {}
 */
export const REPOSITORY_TOKENS = {
  CLIENT: Symbol('CLIENT_REPOSITORY'),
  OPERATION: Symbol('OPERATION_REPOSITORY'),
} as const;
