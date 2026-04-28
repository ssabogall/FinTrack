import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import type { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';
import { TransactionService } from './transaction.service';

@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post()
  create(
    @Body() dto: CreateTransactionDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Transaction> {
    return this.transactionService.create(request.user.sub, dto);
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest): Promise<Transaction[]> {
    return this.transactionService.findAllByUser(request.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<Transaction> {
    return this.transactionService.update(request.user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.transactionService.delete(request.user.sub, id);
  }
}
