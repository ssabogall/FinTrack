"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const typeorm_1 = require("typeorm");
const app_module_1 = require("../app.module");
const category_entity_1 = require("../category/entities/category.entity");
const category_seed_data_1 = require("../category/seeders/category-seed.data");
const goal_entity_1 = require("../goal/entities/goal.entity");
const goal_seed_data_1 = require("../goal/seeders/goal-seed.data");
const transaction_entity_1 = require("../transaction/entities/transaction.entity");
const transaction_seed_data_1 = require("../transaction/seeders/transaction-seed.data");
const user_entity_1 = require("../user/entities/user.entity");
const user_seed_data_1 = require("../user/seeders/user-seed.data");
const user_service_1 = require("../user/user.service");
async function runSeed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userService = app.get(user_service_1.UserService);
    const dataSource = app.get(typeorm_1.DataSource);
    const userRepo = dataSource.getRepository(user_entity_1.User);
    const categoryRepo = dataSource.getRepository(category_entity_1.Category);
    const goalRepo = dataSource.getRepository(goal_entity_1.Goal);
    const transactionRepo = dataSource.getRepository(transaction_entity_1.Transaction);
    for (const seedUser of user_seed_data_1.USER_SEED_DATA) {
        const existing = await userService.findByEmail(seedUser.email);
        if (existing)
            continue;
        await userService.create({
            name: seedUser.name,
            email: seedUser.email,
            password: seedUser.password,
            role: seedUser.role,
        });
    }
    const usersByEmail = new Map();
    for (const user of await userRepo.find()) {
        usersByEmail.set(user.email, user);
    }
    for (const seedCategory of category_seed_data_1.CATEGORY_SEED_DATA) {
        const owner = usersByEmail.get(seedCategory.userEmail);
        if (!owner)
            continue;
        const existing = await categoryRepo.findOne({
            where: { userId: owner.id, name: seedCategory.name },
        });
        if (existing)
            continue;
        await categoryRepo.save(categoryRepo.create({
            name: seedCategory.name,
            color: seedCategory.color,
            type: seedCategory.type,
            userId: owner.id,
        }));
    }
    for (const seedGoal of goal_seed_data_1.GOAL_SEED_DATA) {
        const owner = usersByEmail.get(seedGoal.userEmail);
        if (!owner)
            continue;
        const existing = await goalRepo.findOne({
            where: { userId: owner.id, name: seedGoal.name },
        });
        if (existing)
            continue;
        await goalRepo.save(goalRepo.create({
            name: seedGoal.name,
            description: seedGoal.description,
            targetAmount: seedGoal.targetAmount,
            currentAmount: seedGoal.currentAmount,
            startDate: seedGoal.startDate,
            endDate: seedGoal.endDate,
            status: seedGoal.status,
            userId: owner.id,
        }));
    }
    for (const seedTransaction of transaction_seed_data_1.TRANSACTION_SEED_DATA) {
        const owner = usersByEmail.get(seedTransaction.userEmail);
        if (!owner)
            continue;
        const existing = await transactionRepo.findOne({
            where: {
                userId: owner.id,
                description: seedTransaction.description,
                date: seedTransaction.date,
            },
        });
        if (existing)
            continue;
        let categoryId = null;
        if (seedTransaction.categoryName) {
            const category = await categoryRepo.findOne({
                where: { userId: owner.id, name: seedTransaction.categoryName },
            });
            categoryId = category ? category.id : null;
        }
        let goalId = null;
        if (seedTransaction.goalRef) {
            const goalOwner = usersByEmail.get(seedTransaction.goalRef.userEmail);
            if (goalOwner) {
                const goal = await goalRepo.findOne({
                    where: { userId: goalOwner.id, name: seedTransaction.goalRef.name },
                });
                goalId = goal ? goal.id : null;
            }
        }
        await transactionRepo.save(transactionRepo.create({
            amount: seedTransaction.amount,
            description: seedTransaction.description,
            date: seedTransaction.date,
            userId: owner.id,
            categoryId,
            goalId,
        }));
    }
    await app.close();
}
void runSeed();
//# sourceMappingURL=seed.js.map