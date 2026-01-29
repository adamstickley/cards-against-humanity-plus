import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
  CahGameSessionEntity,
  CahSessionPlayerEntity,
  CahGameRoundEntity,
  CahRoundSubmissionEntity,
  CahSubmissionCardEntity,
  CahPlayerHandEntity,
  CahCardEntity,
  CahSessionCustomCardEntity,
} from '../../../../entities';
import { StartGameDto, SubmitCardsDto, SelectWinnerDto } from './dto';
import { CahGameEventService } from '../cah-game-event';

interface UnifiedCard {
  id: number;
  text: string;
  pick: number | null;
  isCustom: boolean;
}

@Injectable()
export class CahGameRoundService {
  constructor(
    @InjectRepository(CahGameSessionEntity)
    private readonly sessionRepo: Repository<CahGameSessionEntity>,
    @InjectRepository(CahSessionPlayerEntity)
    private readonly playerRepo: Repository<CahSessionPlayerEntity>,
    @InjectRepository(CahGameRoundEntity)
    private readonly roundRepo: Repository<CahGameRoundEntity>,
    @InjectRepository(CahRoundSubmissionEntity)
    private readonly submissionRepo: Repository<CahRoundSubmissionEntity>,
    @InjectRepository(CahSubmissionCardEntity)
    private readonly submissionCardRepo: Repository<CahSubmissionCardEntity>,
    @InjectRepository(CahPlayerHandEntity)
    private readonly handRepo: Repository<CahPlayerHandEntity>,
    @InjectRepository(CahCardEntity)
    private readonly cardRepo: Repository<CahCardEntity>,
    @InjectRepository(CahSessionCustomCardEntity)
    private readonly customCardRepo: Repository<CahSessionCustomCardEntity>,
    private readonly dataSource: DataSource,
    private readonly eventService: CahGameEventService,
  ) {}

  async startGame(
    code: string,
    dto: StartGameDto,
  ): Promise<{ session: CahGameSessionEntity; round: CahGameRoundEntity }> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
      relations: ['players', 'card_packs'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== 'waiting') {
      throw new BadRequestException('Game has already started');
    }

    const hostPlayer = session.players.find((p) => p.is_host);
    if (!hostPlayer || hostPlayer.session_player_id !== dto.playerId) {
      throw new ForbiddenException('Only the host can start the game');
    }

    const connectedPlayers = session.players.filter((p) => p.is_connected);
    if (connectedPlayers.length < 3) {
      throw new BadRequestException(
        'At least 3 players are required to start the game',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      session.status = 'in_progress';
      session.current_round = 1;
      await queryRunner.manager.save(session);

      await this.dealCardsToPlayers(
        queryRunner.manager,
        session,
        connectedPlayers,
      );

      const round = await this.createNewRound(
        queryRunner.manager,
        session,
        connectedPlayers,
        1,
      );

      await queryRunner.commitTransaction();

      // Log round started event
      const judgePlayer = connectedPlayers.find(
        (p) => p.session_player_id === round.judge_player_id,
      );
      const promptCard = await this.getPromptCardInfo(round);
      await this.eventService.logRoundStarted(session.session_id, {
        roundNumber: round.round_number,
        judgePlayerId: round.judge_player_id,
        judgeNickname: judgePlayer?.nickname || 'Unknown',
        promptCardId: round.prompt_card_id || round.custom_prompt_card_id || 0,
        promptText: promptCard?.text || '',
        pickCount: promptCard?.pick || 1,
      });

      return { session, round };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async submitCards(
    code: string,
    roundId: number,
    dto: SubmitCardsDto,
  ): Promise<CahRoundSubmissionEntity> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
      relations: ['players'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== 'in_progress') {
      throw new BadRequestException('Game is not in progress');
    }

    const round = await this.roundRepo.findOne({
      where: { round_id: roundId, session_id: session.session_id },
      relations: ['prompt_card', 'custom_prompt_card', 'submissions'],
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    if (round.status !== 'submissions') {
      throw new BadRequestException('Round is not accepting submissions');
    }

    const player = session.players.find(
      (p) => p.session_player_id === dto.playerId,
    );
    if (!player) {
      throw new NotFoundException('Player not found in this session');
    }

    if (round.judge_player_id === dto.playerId) {
      throw new ForbiddenException('The judge cannot submit cards');
    }

    const existingSubmission = round.submissions.find(
      (s) => s.session_player_id === dto.playerId,
    );
    if (existingSubmission) {
      throw new BadRequestException('You have already submitted cards');
    }

    const requiredCards =
      round.prompt_card?.pick || round.custom_prompt_card?.pick || 1;
    if (dto.cardIds.length !== requiredCards) {
      throw new BadRequestException(
        `This prompt requires exactly ${requiredCards} card(s)`,
      );
    }

    const playerHand = await this.handRepo.find({
      where: { session_player_id: dto.playerId },
    });

    const regularCardIds = playerHand
      .filter((h) => h.card_id !== null)
      .map((h) => h.card_id!);
    const customCardIds = playerHand
      .filter((h) => h.custom_card_id !== null)
      .map((h) => h.custom_card_id!);

    const regularSubmittedIds = dto.cardIds.filter(
      (id) => !dto.customCardIds?.includes(id),
    );
    const customSubmittedIds = dto.customCardIds || [];

    const allRegularInHand = regularSubmittedIds.every((cardId) =>
      regularCardIds.includes(cardId),
    );
    const allCustomInHand = customSubmittedIds.every((cardId) =>
      customCardIds.includes(cardId),
    );

    if (!allRegularInHand || !allCustomInHand) {
      throw new BadRequestException('One or more cards are not in your hand');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const submission = queryRunner.manager.create(CahRoundSubmissionEntity, {
        round_id: roundId,
        session_player_id: dto.playerId,
      });
      const savedSubmission = await queryRunner.manager.save(submission);

      const submissionCards: CahSubmissionCardEntity[] = [];
      let cardOrder = 0;

      for (const cardId of regularSubmittedIds) {
        const submissionCard = queryRunner.manager.create(
          CahSubmissionCardEntity,
          {
            submission_id: savedSubmission.submission_id,
            card_id: cardId,
            custom_card_id: null,
            card_order: cardOrder++,
          },
        );
        submissionCards.push(submissionCard);
      }

      for (const customCardId of customSubmittedIds) {
        const submissionCard = queryRunner.manager.create(
          CahSubmissionCardEntity,
          {
            submission_id: savedSubmission.submission_id,
            card_id: null,
            custom_card_id: customCardId,
            card_order: cardOrder++,
          },
        );
        submissionCards.push(submissionCard);
      }

      await queryRunner.manager.save(submissionCards);

      if (regularSubmittedIds.length > 0) {
        await queryRunner.manager.delete(CahPlayerHandEntity, {
          session_player_id: dto.playerId,
          card_id: In(regularSubmittedIds),
        });
      }

      if (customSubmittedIds.length > 0) {
        await queryRunner.manager.delete(CahPlayerHandEntity, {
          session_player_id: dto.playerId,
          custom_card_id: In(customSubmittedIds),
        });
      }

      const updatedRound = await queryRunner.manager.findOne(
        CahGameRoundEntity,
        {
          where: { round_id: roundId },
          relations: ['submissions'],
        },
      );

      const nonJudgePlayers = session.players.filter(
        (p) => p.is_connected && p.session_player_id !== round.judge_player_id,
      );

      const transitionToJudging =
        updatedRound &&
        updatedRound.submissions.length >= nonJudgePlayers.length;

      if (transitionToJudging && updatedRound) {
        updatedRound.status = 'judging';
        await queryRunner.manager.save(updatedRound);
      }

      await queryRunner.commitTransaction();

      // Log cards submitted event
      const submittedCardTexts = await this.getCardTexts(
        [...regularSubmittedIds],
        customSubmittedIds,
      );
      await this.eventService.logCardsSubmitted(session.session_id, {
        roundNumber: round.round_number,
        playerId: dto.playerId,
        nickname: player.nickname,
        cardIds: [...regularSubmittedIds, ...customSubmittedIds],
        cardTexts: submittedCardTexts,
        submissionOrder: updatedRound?.submissions.length || 1,
      });

      // Log judging started event if transitioning to judging phase
      if (transitionToJudging && updatedRound) {
        await this.eventService.logJudgingStarted(session.session_id, {
          roundNumber: round.round_number,
          submissionCount: updatedRound.submissions.length,
        });
      }

      return savedSubmission;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async selectWinner(
    code: string,
    roundId: number,
    dto: SelectWinnerDto,
  ): Promise<{
    round: CahGameRoundEntity;
    winner: CahSessionPlayerEntity;
    gameOver: boolean;
    nextRound?: CahGameRoundEntity;
  }> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
      relations: ['players'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== 'in_progress') {
      throw new BadRequestException('Game is not in progress');
    }

    const round = await this.roundRepo.findOne({
      where: { round_id: roundId, session_id: session.session_id },
      relations: ['submissions'],
    });

    if (!round) {
      throw new NotFoundException('Round not found');
    }

    if (round.status !== 'judging') {
      throw new BadRequestException('Round is not in judging phase');
    }

    if (round.judge_player_id !== dto.judgePlayerId) {
      throw new ForbiddenException('Only the judge can select a winner');
    }

    const winningSubmission = round.submissions.find(
      (s) => s.submission_id === dto.winningSubmissionId,
    );
    if (!winningSubmission) {
      throw new NotFoundException('Submission not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      round.status = 'complete';
      round.winner_player_id = winningSubmission.session_player_id;
      await queryRunner.manager.save(round);

      const winner = session.players.find(
        (p) => p.session_player_id === winningSubmission.session_player_id,
      );
      if (winner) {
        winner.score += 1;
        await queryRunner.manager.save(winner);
      }

      const gameOver = winner ? winner.score >= session.score_to_win : false;

      let nextRound: CahGameRoundEntity | undefined;

      if (gameOver) {
        session.status = 'completed';
        await queryRunner.manager.save(session);
      } else {
        const connectedPlayers = session.players.filter((p) => p.is_connected);

        await this.drawCardsForPlayers(
          queryRunner.manager,
          session,
          connectedPlayers,
        );

        session.current_round += 1;
        await queryRunner.manager.save(session);

        nextRound = await this.createNewRound(
          queryRunner.manager,
          session,
          connectedPlayers,
          session.current_round,
          round.judge_player_id,
        );
      }

      await queryRunner.commitTransaction();

      // Log winner selected event
      if (winner) {
        const winningSubmissionWithCards = await this.submissionRepo.findOne({
          where: { submission_id: dto.winningSubmissionId },
          relations: ['cards', 'cards.card', 'cards.custom_card'],
        });
        const winningCards =
          winningSubmissionWithCards?.cards
            .sort((a, b) => a.card_order - b.card_order)
            .map((c) => ({
              id: c.card?.card_id ?? c.custom_card_id ?? 0,
              text: c.card?.card_text ?? c.custom_card?.card_text ?? '',
            })) || [];

        await this.eventService.logWinnerSelected(session.session_id, {
          roundNumber: round.round_number,
          winnerId: winner.session_player_id,
          winnerNickname: winner.nickname,
          winningCardIds: winningCards.map((c) => c.id),
          winningCardTexts: winningCards.map((c) => c.text),
          newScore: winner.score,
        });
      }

      // Log game ended event if the game is over
      if (gameOver && winner) {
        const finalScores = session.players
          .map((p) => ({
            playerId: p.session_player_id,
            nickname: p.nickname,
            score:
              p.session_player_id === winner.session_player_id
                ? winner.score
                : p.score,
          }))
          .sort((a, b) => b.score - a.score);

        await this.eventService.logGameEnded(session.session_id, {
          winnerId: winner.session_player_id,
          winnerNickname: winner.nickname,
          winnerScore: winner.score,
          finalScores,
        });
      }

      // Log next round started event if game continues
      if (nextRound && !gameOver) {
        const connectedPlayers = session.players.filter((p) => p.is_connected);
        const judgePlayer = connectedPlayers.find(
          (p) => p.session_player_id === nextRound.judge_player_id,
        );
        const promptCard = await this.getPromptCardInfo(nextRound);
        await this.eventService.logRoundStarted(session.session_id, {
          roundNumber: nextRound.round_number,
          judgePlayerId: nextRound.judge_player_id,
          judgeNickname: judgePlayer?.nickname || 'Unknown',
          promptCardId:
            nextRound.prompt_card_id || nextRound.custom_prompt_card_id || 0,
          promptText: promptCard?.text || '',
          pickCount: promptCard?.pick || 1,
        });
      }

      return {
        round,
        winner: winner!,
        gameOver,
        nextRound,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCurrentRound(code: string): Promise<CahGameRoundEntity | null> {
    const session = await this.sessionRepo.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== 'in_progress') {
      return null;
    }

    return this.roundRepo.findOne({
      where: {
        session_id: session.session_id,
        round_number: session.current_round,
      },
      relations: [
        'prompt_card',
        'custom_prompt_card',
        'judge',
        'submissions',
        'submissions.player',
        'submissions.cards',
        'submissions.cards.card',
        'submissions.cards.custom_card',
      ],
    });
  }

  async getPlayerHand(
    code: string,
    playerId: number,
  ): Promise<CahPlayerHandEntity[]> {
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

    return this.handRepo.find({
      where: { session_player_id: playerId },
      relations: ['card', 'custom_card'],
    });
  }

  private async dealCardsToPlayers(
    manager: typeof this.dataSource.manager,
    session: CahGameSessionEntity,
    players: CahSessionPlayerEntity[],
  ): Promise<void> {
    const cardSetIds = session.card_packs.map((cp) => cp.card_set_id);

    const responseCards = await this.cardRepo.find({
      where: {
        card_type: 'response',
        card_set: { card_set_id: In(cardSetIds) },
      },
    });

    const customResponseCards = await this.customCardRepo.find({
      where: {
        session_id: session.session_id,
        card_type: 'response',
      },
    });

    const allCards: UnifiedCard[] = [
      ...responseCards.map((c) => ({
        id: c.card_id,
        text: c.card_text,
        pick: null,
        isCustom: false,
      })),
      ...customResponseCards.map((c) => ({
        id: c.custom_card_id,
        text: c.card_text,
        pick: null,
        isCustom: true,
      })),
    ];

    if (allCards.length < players.length * session.cards_per_hand) {
      throw new BadRequestException(
        'Not enough response cards in selected packs',
      );
    }

    const shuffled = this.shuffleArray([...allCards]);
    let cardIndex = 0;

    for (const player of players) {
      const handCards: CahPlayerHandEntity[] = [];
      for (let i = 0; i < session.cards_per_hand; i++) {
        const card = shuffled[cardIndex];
        const handCard = manager.create(CahPlayerHandEntity, {
          session_player_id: player.session_player_id,
          card_id: card.isCustom ? null : card.id,
          custom_card_id: card.isCustom ? card.id : null,
        });
        handCards.push(handCard);
        cardIndex++;
      }
      await manager.save(handCards);
    }
  }

  private async drawCardsForPlayers(
    manager: typeof this.dataSource.manager,
    session: CahGameSessionEntity,
    players: CahSessionPlayerEntity[],
  ): Promise<void> {
    const cardSetIds = session.card_packs.map((cp) => cp.card_set_id);

    const usedRegularCardIds = await manager
      .createQueryBuilder(CahPlayerHandEntity, 'hand')
      .innerJoin('hand.player', 'player')
      .where('player.session_id = :sessionId', {
        sessionId: session.session_id,
      })
      .andWhere('hand.card_id IS NOT NULL')
      .select('hand.card_id')
      .getMany();

    const usedCustomCardIds = await manager
      .createQueryBuilder(CahPlayerHandEntity, 'hand')
      .innerJoin('hand.player', 'player')
      .where('player.session_id = :sessionId', {
        sessionId: session.session_id,
      })
      .andWhere('hand.custom_card_id IS NOT NULL')
      .select('hand.custom_card_id')
      .getMany();

    const usedRegularIds = usedRegularCardIds.map((h) => h.card_id!);
    const usedCustomIds = usedCustomCardIds.map((h) => h.custom_card_id!);

    const availableRegularCards = await this.cardRepo
      .createQueryBuilder('card')
      .innerJoin('card.card_set', 'cardSet')
      .where('cardSet.card_set_id IN (:...cardSetIds)', { cardSetIds })
      .andWhere('card.card_type = :type', { type: 'response' })
      .andWhere(
        usedRegularIds.length > 0
          ? 'card.card_id NOT IN (:...usedRegularIds)'
          : '1=1',
        { usedRegularIds },
      )
      .getMany();

    const availableCustomCards = await manager
      .createQueryBuilder(CahSessionCustomCardEntity, 'customCard')
      .where('customCard.session_id = :sessionId', {
        sessionId: session.session_id,
      })
      .andWhere('customCard.card_type = :type', { type: 'response' })
      .andWhere(
        usedCustomIds.length > 0
          ? 'customCard.custom_card_id NOT IN (:...usedCustomIds)'
          : '1=1',
        { usedCustomIds },
      )
      .getMany();

    const allCards: UnifiedCard[] = [
      ...availableRegularCards.map((c) => ({
        id: c.card_id,
        text: c.card_text,
        pick: null,
        isCustom: false,
      })),
      ...availableCustomCards.map((c) => ({
        id: c.custom_card_id,
        text: c.card_text,
        pick: null,
        isCustom: true,
      })),
    ];

    const shuffled = this.shuffleArray([...allCards]);
    let cardIndex = 0;

    for (const player of players) {
      const currentHand = await manager.find(CahPlayerHandEntity, {
        where: { session_player_id: player.session_player_id },
      });

      const cardsNeeded = session.cards_per_hand - currentHand.length;

      for (let i = 0; i < cardsNeeded && cardIndex < shuffled.length; i++) {
        const card = shuffled[cardIndex];
        const handCard = manager.create(CahPlayerHandEntity, {
          session_player_id: player.session_player_id,
          card_id: card.isCustom ? null : card.id,
          custom_card_id: card.isCustom ? card.id : null,
        });
        await manager.save(handCard);
        cardIndex++;
      }
    }
  }

  private async createNewRound(
    manager: typeof this.dataSource.manager,
    session: CahGameSessionEntity,
    players: CahSessionPlayerEntity[],
    roundNumber: number,
    previousJudgeId?: number,
  ): Promise<CahGameRoundEntity> {
    const cardSetIds = session.card_packs.map((cp) => cp.card_set_id);

    const usedPromptIds = await manager
      .createQueryBuilder(CahGameRoundEntity, 'round')
      .where('round.session_id = :sessionId', {
        sessionId: session.session_id,
      })
      .andWhere('round.prompt_card_id IS NOT NULL')
      .select('round.prompt_card_id')
      .getMany();

    const usedCustomPromptIds = await manager
      .createQueryBuilder(CahGameRoundEntity, 'round')
      .where('round.session_id = :sessionId', {
        sessionId: session.session_id,
      })
      .andWhere('round.custom_prompt_card_id IS NOT NULL')
      .select('round.custom_prompt_card_id')
      .getMany();

    const usedRegularIds = usedPromptIds.map((r) => r.prompt_card_id!);
    const usedCustomIds = usedCustomPromptIds.map(
      (r) => r.custom_prompt_card_id!,
    );

    const availableRegularPrompts = await this.cardRepo
      .createQueryBuilder('card')
      .innerJoin('card.card_set', 'cardSet')
      .where('cardSet.card_set_id IN (:...cardSetIds)', { cardSetIds })
      .andWhere('card.card_type = :type', { type: 'prompt' })
      .andWhere(
        usedRegularIds.length > 0
          ? 'card.card_id NOT IN (:...usedRegularIds)'
          : '1=1',
        { usedRegularIds },
      )
      .getMany();

    const availableCustomPrompts = await manager
      .createQueryBuilder(CahSessionCustomCardEntity, 'customCard')
      .where('customCard.session_id = :sessionId', {
        sessionId: session.session_id,
      })
      .andWhere('customCard.card_type = :type', { type: 'prompt' })
      .andWhere(
        usedCustomIds.length > 0
          ? 'customCard.custom_card_id NOT IN (:...usedCustomIds)'
          : '1=1',
        { usedCustomIds },
      )
      .getMany();

    const allPrompts: UnifiedCard[] = [
      ...availableRegularPrompts.map((c) => ({
        id: c.card_id,
        text: c.card_text,
        pick: c.pick,
        isCustom: false,
      })),
      ...availableCustomPrompts.map((c) => ({
        id: c.custom_card_id,
        text: c.card_text,
        pick: c.pick,
        isCustom: true,
      })),
    ];

    if (allPrompts.length === 0) {
      throw new BadRequestException('No more prompt cards available');
    }

    const promptCard =
      allPrompts[Math.floor(Math.random() * allPrompts.length)];

    let judgeIndex = 0;
    if (previousJudgeId) {
      const previousIndex = players.findIndex(
        (p) => p.session_player_id === previousJudgeId,
      );
      judgeIndex = (previousIndex + 1) % players.length;
    }
    const judge = players[judgeIndex];

    const round = manager.create(CahGameRoundEntity, {
      session_id: session.session_id,
      round_number: roundNumber,
      prompt_card_id: promptCard.isCustom ? null : promptCard.id,
      custom_prompt_card_id: promptCard.isCustom ? promptCard.id : null,
      judge_player_id: judge.session_player_id,
      status: 'submissions',
    });

    return manager.save(round);
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private async getPromptCardInfo(
    round: CahGameRoundEntity,
  ): Promise<{ text: string; pick: number } | null> {
    if (round.prompt_card_id) {
      const card = await this.cardRepo.findOne({
        where: { card_id: round.prompt_card_id },
      });
      return card ? { text: card.card_text, pick: card.pick || 1 } : null;
    }
    if (round.custom_prompt_card_id) {
      const card = await this.customCardRepo.findOne({
        where: { custom_card_id: round.custom_prompt_card_id },
      });
      return card ? { text: card.card_text, pick: card.pick || 1 } : null;
    }
    return null;
  }

  private async getCardTexts(
    regularCardIds: number[],
    customCardIds: number[],
  ): Promise<string[]> {
    const texts: string[] = [];

    if (regularCardIds.length > 0) {
      const cards = await this.cardRepo.find({
        where: { card_id: In(regularCardIds) },
      });
      const cardMap = new Map(cards.map((c) => [c.card_id, c.card_text]));
      for (const id of regularCardIds) {
        texts.push(cardMap.get(id) || '');
      }
    }

    if (customCardIds.length > 0) {
      const customCards = await this.customCardRepo.find({
        where: { custom_card_id: In(customCardIds) },
      });
      const customCardMap = new Map(
        customCards.map((c) => [c.custom_card_id, c.card_text]),
      );
      for (const id of customCardIds) {
        texts.push(customCardMap.get(id) || '');
      }
    }

    return texts;
  }
}
