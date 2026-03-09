// internal imports
import type { GoalInterface } from '@/interfaces/GoalInterface';
import type { CreateGoalDTO } from '@/dtos/goal/CreateGoalDTO';
import type { UpdateGoalDTO } from '@/dtos/goal/UpdateGoalDTO';
import { useGoalStore } from '@/stores/goalstore';
import { useAuthStore } from '@/stores/authstore';
import { GoalStatusHelper } from '@/utils/GoalStatusHelper';

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

    const goal = goalStore.goals[index];

    if (!goal) {
      throw new Error('Goal not found.');
    }

    if (goal.status === 'Completed') {
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
    if (!current) {
      throw new Error('Goal not found.');
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : current.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : current.endDate;

    if (endDate <= startDate) {
      throw new Error('End date must be after start date.');
    }

    const updatedTargetAmount = dto.targetAmount ?? current.targetAmount;

    goalStore.goals[index] = {
      id: current.id,
      name: dto.name ?? current.name,
      description: dto.description ?? current.description,
      targetAmount: updatedTargetAmount,
      currentAmount: current.currentAmount,
      startDate,
      endDate,
      status: GoalStatusHelper.compute(current.currentAmount, updatedTargetAmount),
      createdAt: current.createdAt,
      updatedAt: new Date(),
      userId: current.userId,
      transactionIds: current.transactionIds,
    } as GoalInterface;
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
      status: GoalStatusHelper.compute(0, dto.targetAmount),
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
