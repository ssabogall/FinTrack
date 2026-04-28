export type SeedGoalStatus = 'Active' | 'In Progress' | 'Completed';
export type SeedGoal = {
    userEmail: string;
    name: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    startDate: Date;
    endDate: Date;
    status: SeedGoalStatus;
};
export declare const GOAL_SEED_DATA: SeedGoal[];
