import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  CahGameSessionEntity,
  CahSessionPlayerEntity,
  CahSessionCardPackEntity,
  CahCardSetEntity,
  CahGameRoundEntity,
  CahSessionCustomCardEntity,
} from '../../../../entities';
import {
  CreateSessionDto,
  JoinSessionDto,
  ScoreboardDto,
  ScoreboardPlayerDto,
  PlayerScoreHistoryDto,
  RoundWinDto,
  CreateCustomCardDto,
  CustomCardResponseDto,
} from './dto';

@Injectable()
export class CahGameSessionService {
  constructor(
    @InjectRepository(CahGameSessionEntity)
    private readonly sessionRepo: Repository<CahGameSessionEntity>,
    @InjectRepository(CahSessionPlayerEntity)
    private readonly playerRepo: Repository<CahSessionPlayerEntity>,
    @InjectRepository(CahSessionCardPackEntity)
    private readonly cardPackRepo: Repository<CahSessionCardPackEntity>,
    @InjectRepository(CahCardSetEntity)
    private readonly cardSetRepo: Repository<CahCardSetEntity>,
    @InjectRepository(CahGameRoundEntity)
    private readonly roundRepo: Repository<CahGameRoundEntity>,
    @InjectRepository(CahSessionCustomCardEntity)
    private readonly customCardRepo: Repository<CahSessionCustomCardEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createSession(dto: CreateSessionDto): Promise<{
    session: CahGameSessionEntity;
    player: CahSessionPlayerEntity;
  }> {
    if (dto.cardSetIds.length === 0) {
      throw new BadRequestException('At least one card set must be selected');
    }

    const cardSets = await this.cardSetRepo
      .createQueryBuilder('cardSet')
      .where('cardSet.card_set_id IN (:...ids)', { ids: dto.cardSetIds })
      .getMany();

    if (cardSets.length !== dto.cardSetIds.length) {
      throw new BadRequestException('One or more card sets not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const code = await this.generateUniqueCode();

      const session = queryRunner.manager.create(CahGameSessionEntity, {
        code,
        status: 'waiting',
        score_to_win: dto.scoreToWin ?? 8,
        max_players: dto.maxPlayers ?? 10,
        cards_per_hand: dto.cardsPerHand ?? 10,
        round_timer_seconds: dto.roundTimerSeconds,
      });

      const savedSession = await queryRunner.manager.save(session);

      const player = queryRunner.manager.create(CahSessionPlayerEntity, {
        session_id: savedSession.session_id,
        nickname: dto.nickname,
        is_host: true,
        score: 0,
        is_connected: true,
      });

      const savedPlayer = await queryRunner.manager.save(player);

      const cardPacks = dto.cardSetIds.map((cardSetId) =>
        queryRunner.manager.create(CahSessionCardPackEntity, {
          session_id: savedSession.session_id,
          card_set_id: cardSetId,
        }),
      );

      await queryRunner.manager.save(cardPacks);

      if (dto.customCards && dto.customCards.length > 0) {
        const customCards = dto.customCards.map((customCard) =>
          queryRunner.manager.create(CahSessionCustomCardEntity, {
            session_id: savedSession.session_id,
            card_text: customCard.text,
            card_type: customCard.cardType,
            pick:
              customCard.cardType === 'prompt' ? (customCard.pick ?? 1) : null,
          }),
        );

        await queryRunner.manager.save(customCards);
      }

      await queryRunner.commitTransaction();

      return { session: savedSession, player: savedPlayer };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async joinSession(
    code: string,
    dto: JoinSessionDto,
  ): Promise<{
    session: CahGameSessionEntity;
    player: CahSessionPlayerEntity;
  }> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
      relations: ['players'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== 'waiting') {
      throw new BadRequestException('Session is no longer accepting players');
    }

    const activePlayers = session.players.filter((p) => p.is_connected);
    if (activePlayers.length >= session.max_players) {
      throw new BadRequestException('Session is full');
    }

    const existingPlayer = session.players.find(
      (p) => p.nickname.toLowerCase() === dto.nickname.toLowerCase(),
    );
    if (existingPlayer) {
      throw new BadRequestException(
        'Nickname is already taken in this session',
      );
    }

    const player = this.playerRepo.create({
      session_id: session.session_id,
      nickname: dto.nickname,
      is_host: false,
      score: 0,
      is_connected: true,
    });

    const savedPlayer = await this.playerRepo.save(player);

    return { session, player: savedPlayer };
  }

  async getSession(code: string): Promise<CahGameSessionEntity> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
      relations: ['players', 'card_packs', 'card_packs.card_set'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async getSessionPlayers(code: string): Promise<CahSessionPlayerEntity[]> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
      relations: ['players'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session.players;
  }

  async startSession(code: string): Promise<CahGameSessionEntity> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
      relations: ['players'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== 'waiting') {
      throw new BadRequestException('Session has already started');
    }

    const connectedPlayers = session.players.filter((p) => p.is_connected);
    if (connectedPlayers.length < 3) {
      throw new BadRequestException(
        'At least 3 connected players are required to start',
      );
    }

    session.status = 'in_progress';
    session.current_round = 1;

    return this.sessionRepo.save(session);
  }

  async getPlayerById(playerId: number): Promise<CahSessionPlayerEntity> {
    const player = await this.playerRepo.findOne({
      where: { session_player_id: playerId },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return player;
  }

  async getScoreboard(code: string): Promise<ScoreboardDto> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
      relations: ['players'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const roundsWonByPlayer = await this.roundRepo
      .createQueryBuilder('round')
      .select('round.winner_player_id', 'winnerId')
      .addSelect('COUNT(*)', 'roundsWon')
      .where('round.session_id = :sessionId', {
        sessionId: session.session_id,
      })
      .andWhere('round.winner_player_id IS NOT NULL')
      .groupBy('round.winner_player_id')
      .getRawMany<{ winnerId: number; roundsWon: string }>();

    const roundsWonMap = new Map(
      roundsWonByPlayer.map((r) => [r.winnerId, parseInt(r.roundsWon, 10)]),
    );

    const sortedPlayers = [...session.players].sort(
      (a, b) => b.score - a.score,
    );

    const players: ScoreboardPlayerDto[] = sortedPlayers.map(
      (player, index) => ({
        playerId: player.session_player_id,
        nickname: player.nickname,
        score: player.score,
        roundsWon: roundsWonMap.get(player.session_player_id) || 0,
        isHost: player.is_host,
        isConnected: player.is_connected,
        rank: index + 1,
      }),
    );

    const topScore = players.length > 0 ? players[0].score : 0;
    const leadersCount = players.filter((p) => p.score === topScore).length;
    const isTied = leadersCount > 1 && topScore > 0;

    return {
      sessionCode: session.code,
      scoreToWin: session.score_to_win,
      currentRound: session.current_round,
      gameStatus: session.status,
      players,
      leader: topScore > 0 ? players[0] : null,
      isTied,
    };
  }

  async getPlayerScoreHistory(
    code: string,
    playerId: number,
  ): Promise<PlayerScoreHistoryDto> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
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

    const wonRounds = await this.roundRepo.find({
      where: {
        session_id: session.session_id,
        winner_player_id: playerId,
      },
      relations: [
        'prompt_card',
        'custom_prompt_card',
        'submissions',
        'submissions.cards',
        'submissions.cards.card',
        'submissions.cards.custom_card',
      ],
      order: { round_number: 'ASC' },
    });

    const roundsWon: RoundWinDto[] = wonRounds.map((round) => {
      const winningSubmission = round.submissions.find(
        (s) => s.session_player_id === playerId,
      );

      const winningCards =
        winningSubmission?.cards
          .sort((a, b) => a.card_order - b.card_order)
          .map((c) => ({
            cardId: c.card?.card_id ?? c.custom_card_id ?? 0,
            text: c.card?.card_text ?? c.custom_card?.card_text ?? '',
          })) || [];

      return {
        roundId: round.round_id,
        roundNumber: round.round_number,
        promptText:
          round.prompt_card?.card_text ??
          round.custom_prompt_card?.card_text ??
          '',
        winningCards,
        wonAt: round.created_at,
      };
    });

    return {
      playerId: player.session_player_id,
      nickname: player.nickname,
      totalScore: player.score,
      roundsWon,
    };
  }

  async addCustomCard(
    code: string,
    dto: CreateCustomCardDto,
  ): Promise<CustomCardResponseDto> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (dto.cardType === 'response' && dto.pick) {
      throw new BadRequestException(
        'Pick value is only allowed for prompt cards',
      );
    }

    const customCard = new CahSessionCustomCardEntity();
    customCard.session_id = session.session_id;
    customCard.card_text = dto.text;
    customCard.card_type = dto.cardType;
    customCard.pick = dto.cardType === 'prompt' ? (dto.pick ?? 1) : null;

    const savedCard = await this.customCardRepo.save(customCard);

    return {
      customCardId: savedCard.custom_card_id,
      text: savedCard.card_text,
      cardType: savedCard.card_type,
      pick: savedCard.pick,
      createdAt: savedCard.created_at,
    };
  }

  async removeCustomCard(code: string, customCardId: number): Promise<void> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const customCard = await this.customCardRepo.findOne({
      where: {
        custom_card_id: customCardId,
        session_id: session.session_id,
      },
    });

    if (!customCard) {
      throw new NotFoundException('Custom card not found in this session');
    }

    await this.customCardRepo.remove(customCard);
  }

  async getCustomCards(code: string): Promise<CustomCardResponseDto[]> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const customCards = await this.customCardRepo.find({
      where: { session_id: session.session_id },
      order: { created_at: 'ASC' },
    });

    return customCards.map((card) => ({
      customCardId: card.custom_card_id,
      text: card.card_text,
      cardType: card.card_type,
      pick: card.pick,
      createdAt: card.created_at,
    }));
  }

  private async generateUniqueCode(): Promise<string> {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const codeLength = 6;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      let code = '';
      for (let i = 0; i < codeLength; i++) {
        code += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }

      const existing = await this.sessionRepo.findOne({ where: { code } });
      if (!existing) {
        return code;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique session code');
  }
}
