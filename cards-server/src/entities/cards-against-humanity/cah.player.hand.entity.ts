import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CahSessionPlayerEntity } from './cah.session.player.entity';
import { CahCardEntity } from './cah.card.entity';

@Entity({ name: 'cah_player_hands' })
export class CahPlayerHandEntity {
  @PrimaryGeneratedColumn('increment')
  player_hand_id: number;

  @ManyToOne(() => CahSessionPlayerEntity, (player) => player.hand)
  @JoinColumn({ name: 'session_player_id' })
  player: CahSessionPlayerEntity;

  @Column({ type: 'integer' })
  session_player_id: number;

  @ManyToOne(() => CahCardEntity)
  @JoinColumn({ name: 'card_id' })
  card: CahCardEntity;

  @Column({ type: 'integer' })
  card_id: number;
}
