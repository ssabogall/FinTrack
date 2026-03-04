// internal imports
import type { GoalInterface } from '@/interfaces/GoalInterface';
import type { CreateGoalDTO } from '@/dto/CreateGoalDTO';
import { useGoalStore } from '@/stores/goalStore';
import { useAuthStore } from '@/stores/authstore';

export class GoalService {
  public static getAll(): GoalInterface[] {
    return useGoalStore().goals;
  }

  public static getById(id: number): GoalInterface | undefined {
    return useGoalStore().goals.find((goal) => goal.id === id);
  }

  public static create(dto: CreateGoalDTO): void {
    if (!dto.name.trim()) {
      throw new Error('Goal name cannot be empty.');
    }

    if (dto.targetAmount <= 0) {
      throw new Error('Target amount must be greater than 0.');
    }

    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new Error('End date must be after start date.');
    }

    const goalStore = useGoalStore();
    const authStore = useAuthStore();

    const now = new Date();
    const id = Date.now();

    const newGoal: GoalInterface = {
      id,
      name: dto.name,
      description: dto.description,
      targetAmount: dto.targetAmount,
      currentAmount: 0,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: 'Active',
      createdAt: now,
      updatedAt: now,
      userId: dto.userId,
      transactionIds: [],
    };

    goalStore.goals.push(newGoal);

    if (authStore.currentUser) {
      authStore.currentUser.goalIds = [...(authStore.currentUser.goalIds ?? []), id];
    }
  }
}
