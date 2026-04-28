export type SeedUser = {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
};
export declare const USER_SEED_DATA: SeedUser[];
