// external imports
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const token: string | undefined = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const payload: Record<string, unknown> =
        await this.jwtService.verifyAsync<Record<string, unknown>>(token);
      (request as Request & { user: Record<string, unknown> }).user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
