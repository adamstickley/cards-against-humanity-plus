import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CahGameSessionService } from './cah-game-session.service';
import { CahCardDealerService } from './cah-card-dealer.service';
import { CahGameGateway, PlayerPresenceService } from '../cah-game-gateway';
import { CreateSessionDto, JoinSessionDto, CreateCustomCardDto } from './dto';

@Controller('session')
export class CahGameSessionController {
  constructor(
    private readonly sessionService: CahGameSessionService,
    private readonly cardDealerService: CahCardDealerService,
    private readonly gameGateway: CahGameGateway,
    private readonly presenceService: PlayerPresenceService,
  ) {}

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

    const connectedPlayers = session.players.filter((p) => p.is_connected);
    this.gameGateway.emitPlayerJoined(
      session.code,
      {
        playerId: player.session_player_id,
        nickname: player.nickname,
        score: player.score,
        isHost: player.is_host,
        isConnected: player.is_connected,
      },
      connectedPlayers.length + 1,
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

  @Post(':code/start')
  async startGame(@Param('code') code: string) {
    const session = await this.sessionService.startSession(code);
    await this.cardDealerService.dealInitialHands(session.session_id);

    return {
      code: session.code,
      sessionId: session.session_id,
      status: session.status,
      currentRound: session.current_round,
    };
  }

  @Get(':code/player/:playerId/hand')
  async getPlayerHand(@Param('playerId', ParseIntPipe) playerId: number) {
    const cards = await this.cardDealerService.getPlayerHand(playerId);
    return cards.map((card) => ({
      cardId: card.card_id,
      text: card.card_text,
      cardType: card.card_type,
    }));
  }

  @Post(':code/player/:playerId/refill')
  async refillPlayerHand(
    @Param('code') code: string,
    @Param('playerId', ParseIntPipe) playerId: number,
  ) {
    const session = await this.sessionService.getSession(code);
    const player = await this.sessionService.getPlayerById(playerId);

    if (player.session_id !== session.session_id) {
      throw new Error('Player does not belong to this session');
    }

    const newCards = await this.cardDealerService.refillPlayerHand(
      playerId,
      session.session_id,
    );

    return {
      newCards: newCards.map((card) => ({
        cardId: card.card_id,
        text: card.card_text,
        cardType: card.card_type,
      })),
    };
  }

  @Get(':code/presence')
  async getSessionPresence(@Param('code') code: string) {
    const session = await this.sessionService.getSession(code);
    const connectedPlayerIds =
      this.presenceService.getConnectedPlayersInSession(code);

    return {
      sessionCode: session.code,
      players: session.players.map((p) => ({
        playerId: p.session_player_id,
        nickname: p.nickname,
        isOnline: connectedPlayerIds.includes(p.session_player_id),
        isConnected: p.is_connected,
        isHost: p.is_host,
      })),
      onlineCount: connectedPlayerIds.length,
      totalCount: session.players.length,
    };
  }

  @Get(':code/scoreboard')
  async getScoreboard(@Param('code') code: string) {
    return this.sessionService.getScoreboard(code);
  }

  @Get(':code/player/:playerId/score-history')
  async getPlayerScoreHistory(
    @Param('code') code: string,
    @Param('playerId', ParseIntPipe) playerId: number,
  ) {
    return this.sessionService.getPlayerScoreHistory(code, playerId);
  }

  @Post(':code/custom-cards')
  async addCustomCard(
    @Param('code') code: string,
    @Body() dto: CreateCustomCardDto,
  ) {
    return this.sessionService.addCustomCard(code, dto);
  }

  @Get(':code/custom-cards')
  async getCustomCards(@Param('code') code: string) {
    return this.sessionService.getCustomCards(code);
  }

  @Delete(':code/custom-cards/:cardId')
  async removeCustomCard(
    @Param('code') code: string,
    @Param('cardId', ParseIntPipe) cardId: number,
  ) {
    await this.sessionService.removeCustomCard(code, cardId);
    return { success: true };
  }
}
