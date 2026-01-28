import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { CahGameSessionEntity } from './cah.game.session.entity';
import { CahCardSetEntity } from './cah.card.set.entity';

@Entity({ name: 'cah_session_card_packs' })
export class CahSessionCardPackEntity {
  @PrimaryGeneratedColumn('increment')
  session_card_pack_id: number;

  @ManyToOne(() => CahGameSessionEntity, (session) => session.card_packs)
  @JoinColumn({ name: 'session_id' })
  session: CahGameSessionEntity;

  @Column({ type: 'integer' })
  session_id: number;

  @ManyToOne(() => CahCardSetEntity)
  @JoinColumn({ name: 'card_set_id' })
  card_set: CahCardSetEntity;

  @Column({ type: 'integer' })
  card_set_id: number;
}
