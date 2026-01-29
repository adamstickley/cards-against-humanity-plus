import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CahRoundSubmissionEntity } from './cah.round.submission.entity';
import { CahCardEntity } from './cah.card.entity';
import { CahSessionCustomCardEntity } from './cah.session.custom.card.entity';

@Entity({ name: 'cah_submission_cards' })
export class CahSubmissionCardEntity {
  @PrimaryGeneratedColumn('increment')
  submission_card_id: number;

  @ManyToOne(() => CahRoundSubmissionEntity, (submission) => submission.cards)
  @JoinColumn({ name: 'submission_id' })
  submission: CahRoundSubmissionEntity;

  @Column({ type: 'integer' })
  submission_id: number;

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

  @Column({ type: 'integer', default: 0 })
  card_order: number;
}
