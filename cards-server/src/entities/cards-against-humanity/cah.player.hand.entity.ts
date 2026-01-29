import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CahSessionPlayerEntity } from './cah.session.player.entity';
import { CahCardEntity } from './cah.card.entity';
import { CahSessionCustomCardEntity } from './cah.session.custom.card.entity';

@Entity({ name: 'cah_player_hands' })
export class CahPlayerHandEntity {
  @PrimaryGeneratedColumn('increment')
  player_hand_id: number;

  @ManyToOne(() => CahSessionPlayerEntity, (player) => player.hand)
  @JoinColumn({ name: 'session_player_id' })
  player: CahSessionPlayerEntity;

  @Column({ type: 'integer' })
  session_player_id: number;

  @ManyToOne(() => CahCardEntity, { nullable: true })
  @JoinColumn({ name: 'card_id' })
  card: CahCardEntity | null;

  @Column({ type: 'integer', nullable: true })
  card_id: number | null;

  @ManyToOne(() => CahSessionCustomCardEntity, { nullable: true })
  @JoinColumn({ name: 'custom_card_id' })
  custom_card: CahSessionCustomCardEntity | null;

  @Column({ type: 'integer', nullable: true })
  custom_card_id: number | null;
}
