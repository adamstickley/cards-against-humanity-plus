import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CahGameRoundEntity } from './cah.game.round.entity';
import { CahSessionPlayerEntity } from './cah.session.player.entity';
import { CahSubmissionCardEntity } from './cah.submission.card.entity';

@Entity({ name: 'cah_round_submissions' })
export class CahRoundSubmissionEntity {
  @PrimaryGeneratedColumn('increment')
  submission_id: number;

  @ManyToOne(() => CahGameRoundEntity, (round) => round.submissions)
  @JoinColumn({ name: 'round_id' })
  round: CahGameRoundEntity;

  @Column({ type: 'integer' })
  round_id: number;

  @ManyToOne(() => CahSessionPlayerEntity)
  @JoinColumn({ name: 'session_player_id' })
  player: CahSessionPlayerEntity;

  @Column({ type: 'integer' })
  session_player_id: number;

  @CreateDateColumn()
  submitted_at: Date;

  @OneToMany(() => CahSubmissionCardEntity, (card) => card.submission)
  cards: CahSubmissionCardEntity[];
}
