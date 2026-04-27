// external imports
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

// internal imports
import { RegisterDto } from './dtos/register-dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user);
  }

  async register(dto: RegisterDto): Promise<{ access_token: string }> {
    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: 'user',
    });

    return this.signToken(user);
  }

  async getMe(userId: number): Promise<Omit<User, 'password'>> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Authenticated user not found');
    }

    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  private async signToken(user: User): Promise<{ access_token: string }> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
