import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CahCardEntity } from './cah.card.entity';

@Entity({ name: 'cah_card_sets' })
export class CahCardSetEntity {
  @PrimaryGeneratedColumn('increment')
  card_set_id: number;

  @Column({ type: 'varchar', length: 300 })
  title: string;

  @Column({ type: 'boolean', default: false })
  recommended: boolean;

  @Column({ type: 'boolean', default: false })
  is_base_set: boolean;

  @Column({ type: 'integer', default: 0 })
  popularity: number;

  @OneToMany(() => CahCardEntity, (card) => card.card_set)
  cards: CahCardEntity[];
}
