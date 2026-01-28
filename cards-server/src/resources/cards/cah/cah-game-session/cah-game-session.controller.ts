import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CahGameSessionService } from './cah-game-session.service';
import { CreateSessionDto, JoinSessionDto } from './dto';

@Controller('session')
export class CahGameSessionController {
  constructor(private readonly sessionService: CahGameSessionService) {}

  @Post()
  async createSession(@Body() dto: CreateSessionDto) {
    const { session, player } = await this.sessionService.createSession(dto);
    return {
      code: session.code,
      sessionId: session.session_id,
      playerId: player.session_player_id,
      settings: {
        scoreToWin: session.score_to_win,
        maxPlayers: session.max_players,
        cardsPerHand: session.cards_per_hand,
        roundTimerSeconds: session.round_timer_seconds,
      },
    };
  }

  @Post(':code/join')
  async joinSession(@Param('code') code: string, @Body() dto: JoinSessionDto) {
    const { session, player } = await this.sessionService.joinSession(
      code,
      dto,
    );
    return {
      code: session.code,
      sessionId: session.session_id,
      playerId: player.session_player_id,
      settings: {
        scoreToWin: session.score_to_win,
        maxPlayers: session.max_players,
        cardsPerHand: session.cards_per_hand,
        roundTimerSeconds: session.round_timer_seconds,
      },
    };
  }

  @Get(':code')
  async getSession(@Param('code') code: string) {
    const session = await this.sessionService.getSession(code);
    return {
      code: session.code,
      sessionId: session.session_id,
      status: session.status,
      currentRound: session.current_round,
      settings: {
        scoreToWin: session.score_to_win,
        maxPlayers: session.max_players,
        cardsPerHand: session.cards_per_hand,
        roundTimerSeconds: session.round_timer_seconds,
      },
      players: session.players.map((p) => ({
        playerId: p.session_player_id,
        nickname: p.nickname,
        score: p.score,
        isHost: p.is_host,
        isConnected: p.is_connected,
      })),
      cardPacks: session.card_packs.map((cp) => ({
        cardSetId: cp.card_set_id,
        title: cp.card_set?.title,
      })),
      createdAt: session.created_at,
    };
  }

  @Get(':code/players')
  async getPlayers(@Param('code') code: string) {
    const players = await this.sessionService.getSessionPlayers(code);
    return players.map((p) => ({
      playerId: p.session_player_id,
      nickname: p.nickname,
      score: p.score,
      isHost: p.is_host,
      isConnected: p.is_connected,
      joinedAt: p.joined_at,
    }));
  }
}
