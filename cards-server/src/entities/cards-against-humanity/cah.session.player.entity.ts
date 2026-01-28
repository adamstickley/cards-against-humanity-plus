import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CahGameSessionEntity } from './cah.game.session.entity';
import { CahPlayerHandEntity } from './cah.player.hand.entity';

@Entity({ name: 'cah_session_players' })
export class CahSessionPlayerEntity {
  @PrimaryGeneratedColumn('increment')
  session_player_id: number;

  @ManyToOne(() => CahGameSessionEntity, (session) => session.players)
  @JoinColumn({ name: 'session_id' })
  session: CahGameSessionEntity;

  @Column({ type: 'integer' })
  session_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  nickname: string;

  @Column({ type: 'integer', default: 0 })
  score: number;

  @Column({ type: 'boolean', default: false })
  is_host: boolean;

  @Column({ type: 'boolean', default: true })
  is_connected: boolean;

  @CreateDateColumn()
  joined_at: Date;

  @OneToMany(() => CahPlayerHandEntity, (hand) => hand.player)
  hand: CahPlayerHandEntity[];
}
