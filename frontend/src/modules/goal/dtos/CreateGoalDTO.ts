// author: Santiago Sabogal
export interface CreateGoalDTO {
  name: string;
  description?: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
}
