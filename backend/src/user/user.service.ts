// external imports
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';

// internal imports
import { User } from './entities/user.entity';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    const adminEmail: string = (
      process.env.SEED_ADMIN_EMAIL ?? 'admin@fintrack.local'
    )
      .trim()
      .toLowerCase();
    const adminPassword: string = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
    const adminName: string = process.env.SEED_ADMIN_NAME ?? 'Admin User';

    const existingAdmin: User | null = await this.findByEmail(adminEmail);
    if (existingAdmin) {
      return;
    }

    const hashedPassword: string = await hash(adminPassword, 10);
    const adminUser: User = this.userRepository.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });
    await this.userRepository.save(adminUser);
  }

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

  async updatePassword(id: number, password: string): Promise<void> {
    await this.userRepository.update(id, { password });
  }
}
