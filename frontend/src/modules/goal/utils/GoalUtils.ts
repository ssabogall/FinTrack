// author: Santiago Sabogal
// internal imports
import type { GoalInterface } from '@/modules/goal/interfaces/GoalInterface';

export type GoalStatus = 'Active' | 'In Progress' | 'Completed';

export class GoalUtils {
  private readonly goals: GoalInterface[];

  constructor({ goals }: { goals: GoalInterface[] }) {
    this.goals = goals;
  }

  public getSummary(): {
    totalTarget: number;
    totalSaved: number;
    activeCount: number;
    completedCount: number;
  } {
    const totalTarget = this.goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = this.goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const completedCount = this.goals.filter((g) => g.status === 'Completed').length;
    const activeCount = this.goals.length - completedCount;
    return { totalTarget, totalSaved, activeCount, completedCount };
  }

  public getProgressChart(): {
    labels: string[];
    saved: number[];
    remaining: number[];
  } {
    const sorted = [...this.goals].sort((a, b) => b.targetAmount - a.targetAmount).slice(0, 7);
    return {
      labels: sorted.map((g) => g.name),
      saved: sorted.map((g) => g.currentAmount),
      remaining: sorted.map((g) => Math.max(g.targetAmount - g.currentAmount, 0)),
    };
  }

  public getDistributionChart(): {
    labels: string[];
    amounts: number[];
    colors: string[];
  } {
    const palette = ['#0B2C3D', '#E5A00D', '#16A34A', '#0EA5E9', '#8B5CF6', '#14B8A6', '#EF4444'];
    const sorted = [...this.goals].sort((a, b) => b.currentAmount - a.currentAmount).slice(0, 7);
    return {
      labels: sorted.map((g) => g.name),
      amounts: sorted.map((g) => g.currentAmount),
      colors: sorted.map((_, idx) => palette[idx % palette.length]!),
    };
  }
}

export class GoalStatusUtils {
  private readonly currentAmount: number;
  private readonly targetAmount: number;

  constructor({ currentAmount, targetAmount }: { currentAmount: number; targetAmount: number }) {
    this.currentAmount = currentAmount;
    this.targetAmount = targetAmount;
  }

  public getStatus(): GoalStatus {
    if (this.currentAmount <= 0) return 'Active';
    if (this.currentAmount >= this.targetAmount) return 'Completed';
    return 'In Progress';
  }

  public getColor(): string {
    const colors: Record<GoalStatus, string> = {
      Active: '#64748B',
      'In Progress': '#3B82F6',
      Completed: '#1FA971',
    };
    return colors[this.getStatus()];
  }

  public getBackgroundColor(): string {
    const colors: Record<GoalStatus, string> = {
      Active: '#F1F5F9',
      'In Progress': '#EFF6FF',
      Completed: '#F0FDF8',
    };
    return colors[this.getStatus()];
  }

  public getIcon(): string {
    const icons: Record<GoalStatus, string> = {
      Active: 'fa-circle',
      'In Progress': 'fa-spinner',
      Completed: 'fa-check-circle',
    };
    return icons[this.getStatus()];
  }
}
