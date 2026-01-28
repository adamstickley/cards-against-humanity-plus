import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CahGameRoundStatus } from '../../types';
import { CahGameSessionEntity } from './cah.game.session.entity';
import { CahSessionPlayerEntity } from './cah.session.player.entity';
import { CahCardEntity } from './cah.card.entity';
import { CahRoundSubmissionEntity } from './cah.round.submission.entity';

@Entity({ name: 'cah_game_rounds' })
export class CahGameRoundEntity {
  @PrimaryGeneratedColumn('increment')
  round_id: number;

  @ManyToOne(() => CahGameSessionEntity, (session) => session.rounds)
  @JoinColumn({ name: 'session_id' })
  session: CahGameSessionEntity;

  @Column({ type: 'integer' })
  session_id: number;

  @Column({ type: 'integer' })
  round_number: number;

  @ManyToOne(() => CahCardEntity)
  @JoinColumn({ name: 'prompt_card_id' })
  prompt_card: CahCardEntity;

  @Column({ type: 'integer' })
  prompt_card_id: number;

  @ManyToOne(() => CahSessionPlayerEntity)
  @JoinColumn({ name: 'judge_player_id' })
  judge: CahSessionPlayerEntity;

  @Column({ type: 'integer' })
  judge_player_id: number;

  @Column({ type: 'varchar', default: 'submissions' })
  status: CahGameRoundStatus;

  @ManyToOne(() => CahSessionPlayerEntity, { nullable: true })
  @JoinColumn({ name: 'winner_player_id' })
  winner: CahSessionPlayerEntity;

  @Column({ type: 'integer', nullable: true })
  winner_player_id: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => CahRoundSubmissionEntity, (submission) => submission.round)
  submissions: CahRoundSubmissionEntity[];
}
