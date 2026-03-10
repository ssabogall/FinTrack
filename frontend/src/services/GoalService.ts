// author: Santiago Sabogal
// internal imports
import type { GoalInterface } from '@/interfaces/GoalInterface';
import type { CreateGoalDTO } from '@/dtos/goal/CreateGoalDTO';
import type { UpdateGoalDTO } from '@/dtos/goal/UpdateGoalDTO';
import { useGoalStore } from '@/stores/goalstore';
import { useAuthStore } from '@/stores/authstore';
import { GoalStatusHelper } from '@/utils/GoalStatusHelper';

export class GoalService {
  public static toDateInputValue(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().substring(0, 10);
  }

  public static createForCurrentUser(payload: {
    name: string;
    description: string;
    targetAmount: number;
    startDate: string;
    endDate: string;
  }): void {
    const authStore = useAuthStore();
    const currentUserId = authStore.currentUser?.id;
    if (!currentUserId) throw new Error('Not authenticated.');

    GoalService.create({
      name: payload.name,
      description: payload.description,
      targetAmount: payload.targetAmount,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      userId: currentUserId,
    });
  }

  public static updateFromForm(
    id: number,
    payload: {
      name: string;
      description: string;
      targetAmount: number;
      startDate: string;
      endDate: string;
    },
  ): void {
    GoalService.update(id, {
      name: payload.name,
      description: payload.description,
      targetAmount: payload.targetAmount,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
    });
  }

  public static getInitialValuesForEdit(id: number): {
    name?: string;
    description?: string;
    targetAmount?: number;
    startDate?: string;
    endDate?: string;
  } {
    const goal = GoalService.getById(id);
    if (!goal) return {};
    return {
      name: goal.name,
      description: goal.description,
      targetAmount: goal.targetAmount,
      startDate: GoalService.toDateInputValue(goal.startDate),
      endDate: GoalService.toDateInputValue(goal.endDate),
    };
  }

  public static getAll(): GoalInterface[] {
    return useGoalStore().goals;
  }

  public static getForCurrentUser(): GoalInterface[] {
    const authStore = useAuthStore();
    const currentUserId = authStore.currentUser?.id;
    if (!currentUserId) return [];
    return useGoalStore().goals.filter((g) => g.userId === currentUserId);
  }

  public static getSummaryForCurrentUser(): {
    totalTarget: number;
    totalSaved: number;
    activeCount: number;
    completedCount: number;
  } {
    const goals = GoalService.getForCurrentUser();
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const completedCount = goals.filter((g) => g.status === 'Completed').length;
    const activeCount = goals.length - completedCount;
    return { totalTarget, totalSaved, activeCount, completedCount };
  }

  public static getProgressChartForCurrentUser(): {
    labels: string[];
    saved: number[];
    remaining: number[];
  } {
    const goals = GoalService.getForCurrentUser();
    const sorted = [...goals].sort((a, b) => b.targetAmount - a.targetAmount).slice(0, 7);
    return {
      labels: sorted.map((g) => g.name),
      saved: sorted.map((g) => g.currentAmount),
      remaining: sorted.map((g) => Math.max(g.targetAmount - g.currentAmount, 0)),
    };
  }

  public static getDistributionChartForCurrentUser(): {
    labels: string[];
    amounts: number[];
    colors: string[];
  } {
    const goals = GoalService.getForCurrentUser();
    const palette = ['#0B2C3D', '#E5A00D', '#16A34A', '#0EA5E9', '#8B5CF6', '#14B8A6', '#EF4444'];
    const sorted = [...goals].sort((a, b) => b.currentAmount - a.currentAmount).slice(0, 7);
    return {
      labels: sorted.map((g) => g.name),
      amounts: sorted.map((g) => g.currentAmount),
      colors: sorted.map((_, idx) => palette[idx % palette.length]!),
    };
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
