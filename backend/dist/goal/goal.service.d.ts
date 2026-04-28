import { Repository } from 'typeorm';
import { CreateGoalDto } from './dtos/create-goal.dto';
import { UpdateGoalDto } from './dtos/update-goal.dto';
import { Goal } from './entities/goal.entity';
export declare class GoalService {
    private goalRepository;
    constructor(goalRepository: Repository<Goal>);
    findAllByUser(userId: number): Promise<Goal[]>;
    findOneByUser(id: number, userId: number): Promise<Goal>;
    create(userId: number, dto: CreateGoalDto): Promise<Goal>;
    update(id: number, userId: number, dto: UpdateGoalDto): Promise<Goal>;
    delete(id: number, userId: number): Promise<void>;
    private static computeStatus;
}
