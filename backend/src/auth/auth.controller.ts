import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/loginDto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
        return this.authService.login(loginDto.email, loginDto.password);
    }
}
