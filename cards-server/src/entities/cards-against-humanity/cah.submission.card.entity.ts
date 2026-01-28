import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CahRoundSubmissionEntity } from './cah.round.submission.entity';
import { CahCardEntity } from './cah.card.entity';

@Entity({ name: 'cah_submission_cards' })
export class CahSubmissionCardEntity {
  @PrimaryGeneratedColumn('increment')
  submission_card_id: number;

  @ManyToOne(() => CahRoundSubmissionEntity, (submission) => submission.cards)
  @JoinColumn({ name: 'submission_id' })
  submission: CahRoundSubmissionEntity;

  @Column({ type: 'integer' })
  submission_id: number;

  @ManyToOne(() => CahCardEntity)
  @JoinColumn({ name: 'card_id' })
  card: CahCardEntity;

  @Column({ type: 'integer' })
  card_id: number;

  @Column({ type: 'integer', default: 0 })
  card_order: number;
}
