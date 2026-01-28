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
} from '../../../../entities';
import { CreateSessionDto, JoinSessionDto } from './dto';

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
