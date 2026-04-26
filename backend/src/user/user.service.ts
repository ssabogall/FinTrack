// external imports
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// internal imports
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private readonly users = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@fintrack.local',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      categoryIds: null,
      goalIds: null,
      transactionIds: [],
    },
    {
      id: 2,
      name: 'Alex Johnson',
      email: 'alex.johnson@fintrack.local',
      password: 'password123',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
