import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CAHCardType } from '../../types';
import { CahGameSessionEntity } from './cah.game.session.entity';

@Entity({ name: 'cah_session_custom_cards' })
export class CahSessionCustomCardEntity {
  @PrimaryGeneratedColumn('increment')
  custom_card_id: number;

  @ManyToOne(() => CahGameSessionEntity)
  @JoinColumn({ name: 'session_id' })
  session: CahGameSessionEntity;

  @Column({ type: 'integer' })
  session_id: number;

  @Column({ type: 'varchar', length: 500 })
  card_text: string;

  @Column({ type: 'varchar' })
  card_type: CAHCardType;

  @Column({ type: 'integer', nullable: true })
  pick: number | null;

  @CreateDateColumn()
  created_at: Date;
}
