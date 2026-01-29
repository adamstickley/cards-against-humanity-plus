import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_preferences' })
export class UserPreferencesEntity {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  clerk_user_id: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'clerk_user_id' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 50, nullable: true })
  preferred_nickname: string;

  @Column({ type: 'integer', default: 8 })
  default_score_to_win: number;

  @Column({ type: 'integer', default: 10 })
  default_max_players: number;

  @Column({ type: 'integer', default: 10 })
  default_cards_per_hand: number;

  @Column({ type: 'integer', nullable: true })
  default_round_timer_seconds: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
