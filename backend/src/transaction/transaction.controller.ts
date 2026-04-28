// External imports
import {
	Controller,
	Post,
	Get,
	Patch,
	Delete,
	Body,
	Param,
	UseGuards,
	Req,
	ParseIntPipe,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';

// Internal imports
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import type { Transaction } from './entities/transaction.entity';

@Controller('transactions')
export class TransactionController {
	constructor(private readonly transactionService: TransactionService) {}

	@UseGuards(AuthGuard)
	@Post()
	public async create(
		@Body() dto: CreateTransactionDto,
		@Req() req: AuthenticatedRequest,
	): Promise<Transaction> {
		const userId = req.user.sub;
		return this.transactionService.create(userId, dto);
	}

	@UseGuards(AuthGuard)
	@Get()
	public async findAll(@Req() req: AuthenticatedRequest): Promise<Transaction[]> {
		const userId = req.user.sub;
		return this.transactionService.findAllByUser(userId);
	}

	@UseGuards(AuthGuard)
	@Patch(':id')
	public async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateTransactionDto,
		@Req() req: AuthenticatedRequest,
	): Promise<Transaction> {
		const userId = req.user.sub;
		return this.transactionService.update(userId, id, dto);
	}

	@UseGuards(AuthGuard)
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async delete(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest): Promise<void> {
		const userId = req.user.sub;
		return this.transactionService.delete(userId, id);
	}
}
