// author: Santiago Sabogal
// internal imports
import type { GoalInterface } from '@/modules/goal/interfaces/GoalInterface';
import type { CreateGoalDTO } from '@/modules/goal/dtos/CreateGoalDTO';
import type { UpdateGoalDTO } from '@/modules/goal/dtos/UpdateGoalDTO';
import { useGoalStore } from '@/modules/goal/stores/goalstore';
import { useAuthStore } from '@/modules/auth/stores/authstore';
import { GoalUtils } from '@/modules/goal/utils/GoalUtils';
import { Formatters } from '@/shared/utils/Formatters';
import { ApiClient } from '@/shared/utils/ApiClient';

/**
 * Wire-format of a Goal as returned by the backend.
 * Date fields arrive as ISO strings and `targetAmount` / `currentAmount`
 * may arrive as strings because of the underlying SQLite decimal column.
 */
interface GoalApiResponse {
  id: number;
  name: string;
  description: string;
  targetAmount: number | string;
  currentAmount: number | string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

interface CreateGoalPayload {
  name: string;
  description: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
}

export class GoalService {
  public static getAll(): GoalInterface[] {
    return useGoalStore().goals;
  }

  public static getById(id: number): GoalInterface | undefined {
    return useGoalStore().goals.find((goal) => goal.id === id);
  }

  public static getForCurrentUser(): GoalInterface[] {
    const authStore = useAuthStore();
    const currentUserId = authStore.currentUser?.id;
    if (!currentUserId) return [];
    return useGoalStore().goals.filter((g) => g.userId === currentUserId);
  }

  /**
   * Fetches every savings goal owned by the current user from
   * GET /api/goals?userId=N and replaces the goals in the local store
   * with the result.
   *
   * The store is the single source of truth for the UI: views and
   * dashboards already read from it via getForCurrentUser, so refilling
   * the store is enough to refresh every component reactively.
   *
   * Goals belonging to other users are not touched. This matters because
   * the same store may already hold goals from another logged-in user
   * during the session (until auth lands and we can reset on logout).
   */
  public static async fetchForCurrentUser(): Promise<GoalInterface[]> {
    const authStore = useAuthStore();
    const currentUserId = authStore.currentUser?.id;
    if (!currentUserId) {
      throw new Error('Not authenticated.');
    }

    const response = await ApiClient.get<GoalApiResponse[]>(
      `/goals?userId=${currentUserId}`,
    );

    const fetched: GoalInterface[] = response.map((item) => GoalService.fromApi(item));

    const goalStore = useGoalStore();
    const otherUsersGoals = goalStore.goals.filter((g) => g.userId !== currentUserId);
    goalStore.goals = [...otherUsersGoals, ...fetched];

    return fetched;
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
      status: GoalUtils.computeStatus(current.currentAmount, updatedTargetAmount),
      createdAt: current.createdAt,
      updatedAt: new Date(),
      userId: current.userId,
      transactionIds: current.transactionIds,
    } as GoalInterface;
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

  /**
   * Creates a savings goal for the current user via POST /api/goals.
   *
   * UX-level validations are performed before hitting the network so the
   * user gets immediate feedback. The backend re-validates the same rules
   * for defense in depth.
   *
   * On success, the persisted goal returned by the backend is pushed to
   * the local store. This keeps the dashboard and the listing in sync
   * until RF-19 (read goals from backend) replaces the local store as
   * the source of truth.
   */
  public static async createForCurrentUser(payload: CreateGoalPayload): Promise<GoalInterface> {
    if (!payload.name.trim()) {
      throw new Error('Goal name cannot be empty.');
    }

    if (payload.targetAmount <= 0) {
      throw new Error('Target amount must be greater than 0.');
    }

    if (new Date(payload.endDate) <= new Date(payload.startDate)) {
      throw new Error('End date must be after start date.');
    }

    const authStore = useAuthStore();
    const currentUserId = authStore.currentUser?.id;
    if (!currentUserId) {
      throw new Error('Not authenticated.');
    }

    const dto: CreateGoalDTO = {
      name: payload.name,
      description: payload.description,
      targetAmount: payload.targetAmount,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      userId: currentUserId,
    };

    const response = await ApiClient.post<GoalApiResponse>('/goals', {
      name: dto.name,
      description: dto.description,
      targetAmount: dto.targetAmount,
      startDate: payload.startDate,
      endDate: payload.endDate,
      userId: dto.userId,
    });

    const created: GoalInterface = GoalService.fromApi(response);

    const goalStore = useGoalStore();
    goalStore.goals.push(created);

    if (authStore.currentUser) {
      authStore.currentUser.goalIds = [
        ...(authStore.currentUser.goalIds ?? []),
        created.id,
      ];
    }

    return created;
  }

  /**
   * Updates the goal identified by `id` via PATCH /api/goals/:id and
   * replaces the corresponding entry in the local store with the
   * persisted version returned by the backend.
   *
   * UX-level validations are performed before hitting the network so the
   * user gets immediate feedback. The backend re-validates the same rules
   * for defense in depth, and is the source of truth for the recomputed
   * status.
   */
  public static async updateFromForm(
    id: number,
    payload: {
      name: string;
      description: string;
      targetAmount: number;
      startDate: string;
      endDate: string;
    },
  ): Promise<GoalInterface> {
    if (!payload.name.trim()) {
      throw new Error('Goal name cannot be empty.');
    }

    if (payload.targetAmount <= 0) {
      throw new Error('Target amount must be greater than 0.');
    }

    if (new Date(payload.endDate) <= new Date(payload.startDate)) {
      throw new Error('End date must be after start date.');
    }

    const authStore = useAuthStore();
    const currentUserId = authStore.currentUser?.id;
    if (!currentUserId) {
      throw new Error('Not authenticated.');
    }

    const response = await ApiClient.patch<GoalApiResponse>(`/goals/${id}`, {
      name: payload.name,
      description: payload.description,
      targetAmount: payload.targetAmount,
      startDate: payload.startDate,
      endDate: payload.endDate,
      userId: currentUserId,
    });

    const updated: GoalInterface = GoalService.fromApi(response);

    const goalStore = useGoalStore();
    const index = goalStore.goals.findIndex((g) => g.id === id);
    if (index !== -1) {
      goalStore.goals[index] = updated;
    } else {
      goalStore.goals.push(updated);
    }

    return updated;
  }

  /**
   * Permanently deletes the goal identified by `id` via
   * DELETE /api/goals/:id?userId=N and removes the corresponding entry
   * from the local store on success.
   *
   * Business rules (e.g. completed goals cannot be deleted) are enforced
   * by the backend; the error message returned by the API is propagated
   * to the caller so the UI can surface it verbatim.
   */
  public static async deleteForCurrentUser(id: number): Promise<void> {
    const authStore = useAuthStore();
    const currentUserId = authStore.currentUser?.id;
    if (!currentUserId) {
      throw new Error('Not authenticated.');
    }

    await ApiClient.delete<void>(`/goals/${id}?userId=${currentUserId}`);

    const goalStore = useGoalStore();
    const index = goalStore.goals.findIndex((g) => g.id === id);
    if (index !== -1) {
      goalStore.goals.splice(index, 1);
    }

    if (authStore.currentUser?.goalIds) {
      authStore.currentUser.goalIds = authStore.currentUser.goalIds.filter(
        (goalId) => goalId !== id,
      );
    }
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
      startDate: Formatters.toDateInputValue(goal.startDate),
      endDate: Formatters.toDateInputValue(goal.endDate),
    };
  }

  // ---------------------------
  // Dashboards
  // ---------------------------

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

  /**
   * Adapts a goal coming from the backend (with ISO date strings and
   * possibly stringified decimals) to the wider GoalInterface shape used
   * across the frontend.
   */
  private static fromApi(api: GoalApiResponse): GoalInterface {
    return {
      id: api.id,
      name: api.name,
      description: api.description,
      targetAmount: Number(api.targetAmount),
      currentAmount: Number(api.currentAmount),
      startDate: new Date(api.startDate),
      endDate: new Date(api.endDate),
      status: api.status,
      createdAt: new Date(api.createdAt),
      updatedAt: new Date(api.updatedAt),
      userId: api.userId,
      transactionIds: [],
    };
  }
}
