import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '../app.module';
import { Category } from '../category/entities/category.entity';
import { CATEGORY_SEED_DATA } from '../category/seeders/category-seed.data';
import { Goal } from '../goal/entities/goal.entity';
import { GOAL_SEED_DATA } from '../goal/seeders/goal-seed.data';
import { Transaction } from '../transaction/entities/transaction.entity';
import { TRANSACTION_SEED_DATA } from '../transaction/seeders/transaction-seed.data';
import { User } from '../user/entities/user.entity';
import { USER_SEED_DATA } from '../user/seeders/user-seed.data';
import { UserService } from '../user/user.service';

async function runSeed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);
  const dataSource = app.get(DataSource);

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const goalRepo = dataSource.getRepository(Goal);
  const transactionRepo = dataSource.getRepository(Transaction);

  // ---------------------------------------------------------------
  // Users (delegated to UserService so passwords are hashed correctly)
  // ---------------------------------------------------------------
  for (const seedUser of USER_SEED_DATA) {
    const existing = await userService.findByEmail(seedUser.email);
    if (existing) continue;

    await userService.create({
      name: seedUser.name,
      email: seedUser.email,
      password: seedUser.password,
      role: seedUser.role,
    });
  }

  // ---------------------------------------------------------------
  // Cache users by email so we can resolve foreign keys cheaply
  // ---------------------------------------------------------------
  const usersByEmail = new Map<string, User>();
  for (const user of await userRepo.find()) {
    usersByEmail.set(user.email, user);
  }

  // ---------------------------------------------------------------
  // Categories: idempotent on (userId, name)
  // ---------------------------------------------------------------
  for (const seedCategory of CATEGORY_SEED_DATA) {
    const owner = usersByEmail.get(seedCategory.userEmail);
    if (!owner) continue;

    const existing = await categoryRepo.findOne({
      where: { userId: owner.id, name: seedCategory.name },
    });
    if (existing) continue;

    await categoryRepo.save(
      categoryRepo.create({
        name: seedCategory.name,
        color: seedCategory.color,
        type: seedCategory.type,
        userId: owner.id,
      }),
    );
  }

  // ---------------------------------------------------------------
  // Goals: idempotent on (userId, name)
  // ---------------------------------------------------------------
  for (const seedGoal of GOAL_SEED_DATA) {
    const owner = usersByEmail.get(seedGoal.userEmail);
    if (!owner) continue;

    const existing = await goalRepo.findOne({
      where: { userId: owner.id, name: seedGoal.name },
    });
    if (existing) continue;

    await goalRepo.save(
      goalRepo.create({
        name: seedGoal.name,
        description: seedGoal.description,
        targetAmount: seedGoal.targetAmount,
        currentAmount: seedGoal.currentAmount,
        startDate: seedGoal.startDate,
        endDate: seedGoal.endDate,
        status: seedGoal.status,
        userId: owner.id,
      }),
    );
  }

  // ---------------------------------------------------------------
  // Transactions: idempotent on (userId, description, date)
  // Categories and goals are resolved under each transaction owner
  // to keep the seeded data consistent for ownership checks.
  // ---------------------------------------------------------------
  for (const seedTransaction of TRANSACTION_SEED_DATA) {
    const owner = usersByEmail.get(seedTransaction.userEmail);
    if (!owner) continue;

    const existing = await transactionRepo.findOne({
      where: {
        userId: owner.id,
        description: seedTransaction.description,
        date: seedTransaction.date,
      },
    });
    if (existing) continue;

    let categoryId: number | null = null;
    if (seedTransaction.categoryName) {
      const category = await categoryRepo.findOne({
        where: { userId: owner.id, name: seedTransaction.categoryName },
      });
      categoryId = category ? category.id : null;
    }

    let goalId: number | null = null;
    if (seedTransaction.goalRef) {
      const goalOwner = usersByEmail.get(seedTransaction.goalRef.userEmail);
      if (goalOwner) {
        const goal = await goalRepo.findOne({
          where: { userId: goalOwner.id, name: seedTransaction.goalRef.name },
        });
        goalId = goal ? goal.id : null;
      }
    }

    await transactionRepo.save(
      transactionRepo.create({
        amount: seedTransaction.amount,
        description: seedTransaction.description,
        date: seedTransaction.date,
        userId: owner.id,
        categoryId,
        goalId,
      }),
    );
  }

  await app.close();
}

void runSeed();
