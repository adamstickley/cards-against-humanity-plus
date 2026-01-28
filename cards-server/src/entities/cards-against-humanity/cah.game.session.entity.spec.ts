import { CahGameSessionEntity } from './cah.game.session.entity';
import { CahSessionPlayerEntity } from './cah.session.player.entity';
import { CahSessionCardPackEntity } from './cah.session.card.pack.entity';
import { CahPlayerHandEntity } from './cah.player.hand.entity';
import { CahGameRoundEntity } from './cah.game.round.entity';
import { CahRoundSubmissionEntity } from './cah.round.submission.entity';
import { CahSubmissionCardEntity } from './cah.submission.card.entity';

describe('CAH Game Session Entities', () => {
  describe('CahGameSessionEntity', () => {
    it('should create a new instance', () => {
      const session = new CahGameSessionEntity();
      session.code = 'ABCD1234';
      session.status = 'waiting';
      session.score_to_win = 8;
      session.max_players = 10;
      session.cards_per_hand = 10;

      expect(session.code).toBe('ABCD1234');
      expect(session.status).toBe('waiting');
      expect(session.score_to_win).toBe(8);
    });
  });

  describe('CahSessionPlayerEntity', () => {
    it('should create a new instance', () => {
      const player = new CahSessionPlayerEntity();
      player.nickname = 'TestPlayer';
      player.score = 0;
      player.is_host = true;

      expect(player.nickname).toBe('TestPlayer');
      expect(player.score).toBe(0);
      expect(player.is_host).toBe(true);
    });
  });

  describe('CahSessionCardPackEntity', () => {
    it('should create a new instance', () => {
      const pack = new CahSessionCardPackEntity();
      pack.session_id = 1;
      pack.card_set_id = 1;

      expect(pack.session_id).toBe(1);
      expect(pack.card_set_id).toBe(1);
    });
  });

  describe('CahPlayerHandEntity', () => {
    it('should create a new instance', () => {
      const hand = new CahPlayerHandEntity();
      hand.session_player_id = 1;
      hand.card_id = 1;

      expect(hand.session_player_id).toBe(1);
      expect(hand.card_id).toBe(1);
    });
  });

  describe('CahGameRoundEntity', () => {
    it('should create a new instance', () => {
      const round = new CahGameRoundEntity();
      round.session_id = 1;
      round.round_number = 1;
      round.prompt_card_id = 1;
      round.judge_player_id = 1;
      round.status = 'submissions';

      expect(round.round_number).toBe(1);
      expect(round.status).toBe('submissions');
    });
  });

  describe('CahRoundSubmissionEntity', () => {
    it('should create a new instance', () => {
      const submission = new CahRoundSubmissionEntity();
      submission.round_id = 1;
      submission.session_player_id = 1;

      expect(submission.round_id).toBe(1);
      expect(submission.session_player_id).toBe(1);
    });
  });

  describe('CahSubmissionCardEntity', () => {
    it('should create a new instance', () => {
      const card = new CahSubmissionCardEntity();
      card.submission_id = 1;
      card.card_id = 1;
      card.card_order = 0;

      expect(card.submission_id).toBe(1);
      expect(card.card_id).toBe(1);
      expect(card.card_order).toBe(0);
    });
  });
});
