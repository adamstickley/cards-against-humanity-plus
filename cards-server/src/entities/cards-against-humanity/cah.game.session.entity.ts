import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CahGameSessionStatus } from '../../types';
import { CahSessionPlayerEntity } from './cah.session.player.entity';
import { CahSessionCardPackEntity } from './cah.session.card.pack.entity';
import { CahGameRoundEntity } from './cah.game.round.entity';

@Entity({ name: 'cah_game_sessions' })
export class CahGameSessionEntity {
  @PrimaryGeneratedColumn('increment')
  session_id: number;

  @Column({ type: 'varchar', length: 8, unique: true })
  code: string;

  @Column({ type: 'varchar', default: 'waiting' })
  status: CahGameSessionStatus;

  @Column({ type: 'integer', default: 0 })
  current_round: number;

  @Column({ type: 'integer', default: 8 })
  score_to_win: number;

  @Column({ type: 'integer', default: 10 })
  max_players: number;

  @Column({ type: 'integer', default: 10 })
  cards_per_hand: number;

  @Column({ type: 'integer', nullable: true })
  round_timer_seconds: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => CahSessionPlayerEntity, (player) => player.session)
  players: CahSessionPlayerEntity[];

  @OneToMany(() => CahSessionCardPackEntity, (pack) => pack.session)
  card_packs: CahSessionCardPackEntity[];

  @OneToMany(() => CahGameRoundEntity, (round) => round.session)
  rounds: CahGameRoundEntity[];
}
