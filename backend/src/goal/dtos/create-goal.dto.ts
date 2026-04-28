export class CreateGoalDto {
  name!: string;
  description?: string;
  targetAmount!: number;
  startDate!: string;
  endDate!: string;
  userId!: number;
}
