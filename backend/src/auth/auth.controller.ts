// external imports
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

// internal imports
import { AuthGuard } from './auth.guard';
import type { AuthenticatedRequest } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login-dto';
import { RegisterDto } from './dtos/register-dto';
import { User } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ access_token: string }> {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(
    @Req() request: AuthenticatedRequest,
  ): Promise<Omit<User, 'password'>> {
    return this.authService.getMe(request.user.sub);
  }
}
