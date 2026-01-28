import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CAHCardType } from '../../types';
import { CahCardSetEntity } from './cah.card.set.entity';

@Entity({ name: 'cah_cards' })
export class CahCardEntity {
  @PrimaryGeneratedColumn('increment')
  card_id: number;

  @Column({ type: 'varchar', length: 500 })
  card_text: string;

  @ManyToOne(() => CahCardSetEntity, (cardSet) => cardSet.cards)
  @JoinColumn({ name: 'card_set_id' })
  card_set: CahCardSetEntity;

  @Column({ type: 'varchar' })
  card_type: CAHCardType;

  @Column({ type: 'integer', nullable: true })
  draw: number;

  @Column({ type: 'integer', nullable: true })
  pick: number;
}
