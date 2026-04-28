import type { AuthenticatedRequest } from '../auth/auth.guard';
import { CreateUserDto } from './dtos/create-user-dto';
import { UpdateUserDto } from './dtos/update-user-dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    findAll(): Promise<Omit<User, 'password'>[]>;
    findOne(id: number, request: AuthenticatedRequest): Promise<Omit<User, 'password'> | null>;
    create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>>;
    update(id: number, updateUserDto: UpdateUserDto, request: AuthenticatedRequest): Promise<Omit<User, 'password'>>;
    private assertAdminOrSelf;
    private toSafeUser;
}
