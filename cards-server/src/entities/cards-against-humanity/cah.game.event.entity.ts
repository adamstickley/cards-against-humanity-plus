import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CahGameEventType, CahGameEventData } from '../../types';
import { CahGameSessionEntity } from './cah.game.session.entity';
import { CahSessionPlayerEntity } from './cah.session.player.entity';

@Entity({ name: 'cah_game_events' })
@Index(['session_id', 'created_at'])
@Index(['event_type'])
export class CahGameEventEntity {
  @PrimaryGeneratedColumn('increment')
  event_id: number;

  @ManyToOne(() => CahGameSessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: CahGameSessionEntity;

  @Column({ type: 'integer' })
  @Index()
  session_id: number;

  @Column({ type: 'varchar', length: 50 })
  event_type: CahGameEventType;

  @ManyToOne(() => CahSessionPlayerEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'player_id' })
  player: CahSessionPlayerEntity;

  @Column({ type: 'integer', nullable: true })
  player_id: number | null;

  @Column({ type: 'integer', nullable: true })
  round_number: number | null;

  @Column({ type: 'json', nullable: true })
  event_data: CahGameEventData | null;

  @CreateDateColumn()
  created_at: Date;
}
