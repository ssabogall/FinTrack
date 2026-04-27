import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { USER_SEED_DATA } from '../user/seeders/user-seed.data';

async function runSeed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  // Users
  for (const seedUser of USER_SEED_DATA) {
    const existingUser = await userService.findByEmail(seedUser.email);
    if (existingUser) {
      continue;
    }

    await userService.create({
      name: seedUser.name,
      email: seedUser.email,
      password: seedUser.password,
      role: seedUser.role,
    });
  }

  await app.close();
}

void runSeed();
