import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CahGameSessionEntity,
  CahGameRoundEntity,
  CahPlayerHandEntity,
} from '../../../../entities';
import { PlayerPresenceService } from './player-presence.service';

export interface CardInfo {
  cardId: number;
  text: string;
  pick?: number;
}

export interface PlayerState {
  playerId: number;
  nickname: string;
  score: number;
  isHost: boolean;
  isConnected: boolean;
  isOnline: boolean;
}

export interface SubmissionState {
  submissionId: number;
  playerId: number;
  playerNickname: string;
  cards?: CardInfo[];
  submittedAt: Date;
}

export interface RoundState {
  roundId: number;
  roundNumber: number;
  promptCard: CardInfo;
  judgePlayerId: number;
  judgeNickname: string;
  status: 'pending' | 'submissions' | 'judging' | 'complete';
  submissions: SubmissionState[];
  winnerPlayerId?: number;
}

export interface GameState {
  sessionCode: string;
  sessionId: number;
  status: 'waiting' | 'in_progress' | 'completed';
  settings: {
    scoreToWin: number;
    maxPlayers: number;
    cardsPerHand: number;
    roundTimerSeconds: number | null;
  };
  players: PlayerState[];
  currentRound: RoundState | null;
  myHand?: CardInfo[];
}

@Injectable()
export class GameStateSyncService {
  constructor(
    @InjectRepository(CahGameSessionEntity)
    private readonly sessionRepo: Repository<CahGameSessionEntity>,
    @InjectRepository(CahGameRoundEntity)
    private readonly roundRepo: Repository<CahGameRoundEntity>,
    @InjectRepository(CahPlayerHandEntity)
    private readonly handRepo: Repository<CahPlayerHandEntity>,
    private readonly presenceService: PlayerPresenceService,
  ) {}

  async getFullGameState(
    sessionCode: string,
    playerId?: number,
  ): Promise<GameState> {
    const session = await this.sessionRepo.findOne({
      where: { code: sessionCode.toUpperCase() },
      relations: ['players', 'card_packs'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const connectedPlayerIds =
      this.presenceService.getConnectedPlayersInSession(sessionCode);

    const players: PlayerState[] = session.players.map((p) => ({
      playerId: p.session_player_id,
      nickname: p.nickname,
      score: p.score,
      isHost: p.is_host,
      isConnected: p.is_connected,
      isOnline: connectedPlayerIds.includes(p.session_player_id),
    }));

    let currentRound: RoundState | null = null;

    if (session.status === 'in_progress') {
      currentRound = await this.getCurrentRoundState(session, players);
    }

    let myHand: CardInfo[] | undefined;
    if (playerId) {
      myHand = await this.getPlayerHand(playerId);
    }

    return {
      sessionCode: session.code,
      sessionId: session.session_id,
      status: session.status,
      settings: {
        scoreToWin: session.score_to_win,
        maxPlayers: session.max_players,
        cardsPerHand: session.cards_per_hand,
        roundTimerSeconds: session.round_timer_seconds,
      },
      players,
      currentRound,
      myHand,
    };
  }

  private async getCurrentRoundState(
    session: CahGameSessionEntity,
    players: PlayerState[],
  ): Promise<RoundState | null> {
    const round = await this.roundRepo.findOne({
      where: {
        session_id: session.session_id,
        round_number: session.current_round,
      },
      relations: [
        'prompt_card',
        'judge',
        'submissions',
        'submissions.player',
        'submissions.cards',
        'submissions.cards.card',
      ],
    });

    if (!round) {
      return null;
    }

    const judge = players.find((p) => p.playerId === round.judge_player_id);

    const submissions: SubmissionState[] = round.submissions.map((s) => {
      const showCards =
        round.status === 'judging' || round.status === 'complete';

      return {
        submissionId: s.submission_id,
        playerId: s.session_player_id,
        playerNickname: s.player.nickname,
        cards: showCards
          ? s.cards
              .filter((c) => c.card !== null)
              .sort((a, b) => a.card_order - b.card_order)
              .map((c) => ({
                cardId: c.card!.card_id,
                text: c.card!.card_text,
              }))
          : undefined,
        submittedAt: s.submitted_at,
      };
    });

    return {
      roundId: round.round_id,
      roundNumber: round.round_number,
      promptCard: {
        cardId: round.prompt_card!.card_id,
        text: round.prompt_card!.card_text,
        pick: round.prompt_card!.pick || 1,
      },
      judgePlayerId: round.judge_player_id,
      judgeNickname: judge?.nickname || 'Unknown',
      status: round.status,
      submissions,
      winnerPlayerId: round.winner_player_id || undefined,
    };
  }

  private async getPlayerHand(playerId: number): Promise<CardInfo[]> {
    const handEntries = await this.handRepo.find({
      where: { session_player_id: playerId },
      relations: ['card'],
    });

    return handEntries
      .filter((h) => h.card !== null)
      .map((h) => ({
        cardId: h.card!.card_id,
        text: h.card!.card_text,
      }));
  }

  async getPlayerHandForSession(
    sessionCode: string,
    playerId: number,
  ): Promise<CardInfo[]> {
    const session = await this.sessionRepo.findOne({
      where: { code: sessionCode.toUpperCase() },
      relations: ['players'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const player = session.players.find(
      (p) => p.session_player_id === playerId,
    );

    if (!player) {
      throw new NotFoundException('Player not found in this session');
    }

    return this.getPlayerHand(playerId);
  }
}
