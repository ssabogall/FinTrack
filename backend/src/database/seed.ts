import { NestFactory } from '@nestjs/core';
import { hash } from 'bcrypt';
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

    const hashedPassword = await hash(seedUser.password, 10);
    await userService.create({
      name: seedUser.name,
      email: seedUser.email,
      password: hashedPassword,
      role: seedUser.role,
    });
  }

  await app.close();
}

void runSeed();
