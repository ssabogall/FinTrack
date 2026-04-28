// author: Santiago Sabogal
// external imports
import axios from 'axios';

// internal imports
import type { CreateGoalDTO } from '@/modules/goal/dtos/CreateGoalDTO';
import type { UpdateGoalDTO } from '@/modules/goal/dtos/UpdateGoalDTO';
import type { GoalInterface } from '@/modules/goal/interfaces/GoalInterface';

export class GoalService {
  private static readonly API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  private static readonly API_URL = `${this.API_BASE_URL}/api/goals`;

  public static async getGoalsByUser(userId: number): Promise<GoalInterface[]> {
    const { data } = await axios.get<GoalInterface[]>(`${this.API_URL}?userId=${userId}`);
    return data.map((item) => GoalService.fromApi(item));
  }

  public static async createGoal(dto: CreateGoalDTO): Promise<GoalInterface> {
    const { data } = await axios.post<GoalInterface>(this.API_URL, dto);
    return GoalService.fromApi(data);
  }

  public static async updateGoal(id: number, dto: UpdateGoalDTO): Promise<GoalInterface> {
    const { data } = await axios.patch<GoalInterface>(`${this.API_URL}/${id}`, dto);
    return GoalService.fromApi(data);
  }

  public static async deleteGoal(id: number, userId: number): Promise<void> {
    await axios.delete(`${this.API_URL}/${id}?userId=${userId}`);
  }

  private static fromApi(api: GoalInterface): GoalInterface {
    return {
      ...api,
      targetAmount: Number(api.targetAmount),
      currentAmount: Number(api.currentAmount),
      startDate: new Date(api.startDate),
      endDate: new Date(api.endDate),
      createdAt: new Date(api.createdAt),
      updatedAt: new Date(api.updatedAt),
      transactionIds: api.transactionIds ?? [],
    };
  }
}
