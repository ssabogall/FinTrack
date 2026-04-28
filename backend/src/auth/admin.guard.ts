import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

// internal imports
import type { AuthenticatedRequest } from './auth.guard';
import { UserService } from '../user/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.sub;
    if (!userId) throw new UnauthorizedException('User context not found');

    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('Authenticated user not found');
    if (user.role !== 'admin')
      throw new ForbiddenException('Admin access required');

    return true;
  }
}
