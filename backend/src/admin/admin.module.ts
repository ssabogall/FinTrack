import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// internal imports
import { AdminGuard } from '../auth/admin.guard';
import { Category } from '../category/entities/category.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction, Category]), UserModule],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}
