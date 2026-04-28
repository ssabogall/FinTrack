import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register-dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
    register(dto: RegisterDto): Promise<{
        access_token: string;
    }>;
    getMe(userId: number): Promise<Omit<User, 'password'>>;
    private signToken;
}
