import type { AuthenticatedRequest } from '../auth/auth.guard';
import { CreateGoalDto } from './dtos/create-goal.dto';
import { UpdateGoalDto } from './dtos/update-goal.dto';
import { Goal } from './entities/goal.entity';
import { GoalService } from './goal.service';
export declare class GoalController {
    private goalService;
    constructor(goalService: GoalService);
    findAll(request: AuthenticatedRequest): Promise<Goal[]>;
    findOne(id: number, request: AuthenticatedRequest): Promise<Goal>;
    create(dto: CreateGoalDto, request: AuthenticatedRequest): Promise<Goal>;
    update(id: number, dto: UpdateGoalDto, request: AuthenticatedRequest): Promise<Goal>;
    delete(id: number, request: AuthenticatedRequest): Promise<void>;
}
