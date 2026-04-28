// external imports
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

// internal imports
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { Goal } from '../../goal/entities/goal.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'double' })
  amount: number;

  @Column()
  description: string;

  @Column({ type: 'datetime' })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // relations
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', nullable: true })
  categoryId: number | null;

  @ManyToOne(() => Category, (category) => category.transactions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @Column({ type: 'int', nullable: true })
  goalId: number | null;

  @ManyToOne(() => Goal, (goal) => goal.transactions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'goalId' })
  goal: Goal | null;
}
