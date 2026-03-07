export type GoalStatus = 'Active' | 'In Progress' | 'Completed';

export class GoalStatusHelper {
  public static compute(currentAmount: number, targetAmount: number): GoalStatus {
    if (currentAmount <= 0) return 'Active';
    if (currentAmount >= targetAmount) return 'Completed';
    return 'In Progress';
  }

  public static color(status: GoalStatus): string {
    const colors: Record<GoalStatus, string> = {
      Active: '#64748B',
      'In Progress': '#3B82F6',
      Completed: '#1FA971',
    };
    return colors[status];
  }

  public static bgColor(status: GoalStatus): string {
    const colors: Record<GoalStatus, string> = {
      Active: '#F1F5F9',
      'In Progress': '#EFF6FF',
      Completed: '#F0FDF8',
    };
    return colors[status];
  }

  public static icon(status: GoalStatus): string {
    const icons: Record<GoalStatus, string> = {
      Active: 'fa-circle',
      'In Progress': 'fa-spinner',
      Completed: 'fa-check-circle',
    };
    return icons[status];
  }
}
