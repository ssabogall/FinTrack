// external imports
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// internal imports
import { Transaction } from '../../transaction/entities/transaction.entity';
import { User } from '../../user/entities/user.entity';

export type GoalStatus = 'Active' | 'In Progress' | 'Completed';

@Entity()
export class Goal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 12, scale: 2 })
  targetAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  currentAmount: number;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column()
  status: GoalStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.goal)
  transactions: Transaction[];
}
