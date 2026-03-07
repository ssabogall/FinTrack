// internal imports
import type { GoalInterface } from '@/interfaces/GoalInterface';
import type { CreateGoalDTO } from '@/dtos/CreateGoalDTO';
import type { UpdateGoalDTO } from '@/dtos/UpdateGoalDTO';
import { useGoalStore } from '@/stores/goalStore';
import { useAuthStore } from '@/stores/authstore';

export class GoalService {
  public static getAll(): GoalInterface[] {
    return useGoalStore().goals;
  }

  public static getById(id: number): GoalInterface | undefined {
    return useGoalStore().goals.find((goal) => goal.id === id);
  }

  public static delete(id: number): void {
    const goalStore = useGoalStore();
    const authStore = useAuthStore();

    const index = goalStore.goals.findIndex((goal) => goal.id === id);

    if (index === -1) {
      throw new Error('Goal not found.');
    }

    if (goalStore.goals[index].status === 'Completed') {
      throw new Error('Completed goals cannot be deleted.');
    }

    goalStore.goals.splice(index, 1);

    if (authStore.currentUser?.goalIds) {
      authStore.currentUser.goalIds = authStore.currentUser.goalIds.filter(
        (goalId) => goalId !== id,
      );
    }
  }

  public static update(id: number, dto: UpdateGoalDTO): void {
    if (dto.name !== undefined && !dto.name.trim()) {
      throw new Error('Goal name cannot be empty.');
    }

    if (dto.targetAmount !== undefined && dto.targetAmount <= 0) {
      throw new Error('Target amount must be greater than 0.');
    }

    const goalStore = useGoalStore();
    const index = goalStore.goals.findIndex((goal) => goal.id === id);

    if (index === -1) {
      throw new Error('Goal not found.');
    }

    const current = goalStore.goals[index];

    const startDate = dto.startDate ? new Date(dto.startDate) : current.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : current.endDate;

    if (endDate <= startDate) {
      throw new Error('End date must be after start date.');
    }

    goalStore.goals[index] = {
      ...current,
      name: dto.name ?? current.name,
      description: dto.description ?? current.description,
      targetAmount: dto.targetAmount ?? current.targetAmount,
      startDate,
      endDate,
      updatedAt: new Date(),
    };
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
