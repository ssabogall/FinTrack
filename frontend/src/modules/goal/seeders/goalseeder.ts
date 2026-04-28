// author: Santiago Gómez
import type { GoalInterface } from '@/modules/goal/interfaces/GoalInterface';

/**
 * Empty seeder.
 *
 * Goals are now hydrated at runtime from the backend via
 * GoalService.fetchForCurrentUser. The previous mock data was removed to
 * avoid duplicate IDs and inconsistent state between the local store and
 * the API.
 *
 * The export is kept (instead of deleting the file) so the existing
 * imports in PiniaInit and any in-progress branches keep compiling.
 */
export const goalSeeder: GoalInterface[] = [];
