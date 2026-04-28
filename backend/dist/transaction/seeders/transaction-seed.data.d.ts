export type SeedGoalRef = {
    userEmail: string;
    name: string;
};
export type SeedTransaction = {
    userEmail: string;
    amount: number;
    description: string;
    date: Date;
    categoryName: string | null;
    goalRef: SeedGoalRef | null;
};
export declare const TRANSACTION_SEED_DATA: SeedTransaction[];
