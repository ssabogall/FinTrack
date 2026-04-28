// external imports
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

// internal imports
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { CreateUserDto } from './dtos/create-user-dto';
import { UpdateUserDto } from './dtos/update-user-dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AdminGuard)
  @Get()
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userService.findAll();
    return users.map((user) => this.toSafeUser(user));
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<Omit<User, 'password'> | null> {
    await this.assertAdminOrSelf(request, id);
    const user = await this.userService.findOne(id);
    return user ? this.toSafeUser(user) : null;
  }

  @UseGuards(AdminGuard)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userService.create(createUserDto);
    return this.toSafeUser(user);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Omit<User, 'password'>> {
    const requester = await this.assertAdminOrSelf(request, id);
    if (updateUserDto.role !== undefined && requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can change user roles');
    }

    const user = await this.userService.update(id, updateUserDto);
    return this.toSafeUser(user);
  }

  private async assertAdminOrSelf(
    request: AuthenticatedRequest,
    resourceUserId: number,
  ): Promise<User> {
    const requesterId = request.user?.sub;
    if (!requesterId) throw new ForbiddenException('User context not found');

    const requester = await this.userService.findOne(requesterId);
    if (!requester)
      throw new ForbiddenException('Authenticated user not found');

    if (requester.role !== 'admin' && requester.id !== resourceUserId) {
      throw new ForbiddenException('You can only access your own user');
    }
    return requester;
  }

  private toSafeUser(user: User): Omit<User, 'password'> {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}
