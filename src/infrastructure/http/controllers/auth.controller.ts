import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response, Request } from 'express';

import { LoginUserUseCase } from '../../../application/use-cases/auth/login-user.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUserUseCase } from '../../../application/use-cases/auth/logout-user.use-case';
import { GetCurrentUserUseCase } from '../../../application/use-cases/auth/get-current-user.use-case';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case';
import { UserRole } from '../../../domain/enums/user-role.enum';

import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenRequestDto } from '../dtos/refresh-token-request.dto';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../../../application/ports/token-service.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener tokens de acceso' })
  @ApiResponse({ status: 200, description: 'Autenticación exitosa.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o cuenta inactiva.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.loginUserUseCase.execute(dto);

    const isProd = process.env.NODE_ENV === 'production';
    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotar Refresh Token y obtener un nuevo Access Token' })
  @ApiResponse({ status: 200, description: 'Re-emisión exitosa.' })
  @ApiResponse({ status: 401, description: 'Refresh Token inválido o revocado.' })
  async refresh(
    @Req() request: Request,
    @Body() dto: RefreshTokenRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = request.cookies?.refresh_token || dto.refreshToken;
    const result = await this.refreshTokenUseCase.execute({ refreshToken: token });

    const isProd = process.env.NODE_ENV === 'production';
    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return result;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión y revocar tokens' })
  async logout(
    @Req() request: Request,
    @Body() dto: RefreshTokenRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = request.cookies?.refresh_token || dto.refreshToken;
    await this.logoutUserUseCase.execute({ refreshToken: token });

    response.clearCookie('refresh_token', { path: '/auth' });
    return { message: 'Sesión cerrada exitosamente' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener información del usuario autenticado actual' })
  async getMe(@CurrentUser() userPayload: JwtPayload) {
    return this.getCurrentUserUseCase.execute(userPayload.sub);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo usuario (Inicial / Mesa de Control)' })
  async register(@Body() dto: RegisterUserDto, @Req() req: any) {
    const callerRole = req.user?.role;
    if (dto.role === UserRole.ADMINISTRATOR && callerRole !== UserRole.ADMINISTRATOR) {
      throw new ForbiddenException(
        'Se requieren permisos de Administrador para registrar un usuario con rol ADMINISTRATOR',
      );
    }

    return this.registerUserUseCase.execute({
      ...dto,
      performedBy: req.user?.sub || 'system',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
