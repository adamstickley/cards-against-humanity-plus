import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CahGameRoundService } from './cah-game-round.service';
import { CahGameGateway } from '../cah-game-gateway';
import { StartGameDto, SubmitCardsDto, SelectWinnerDto } from './dto';

@Controller('session/:code/game')
export class CahGameRoundController {
  constructor(
    private readonly roundService: CahGameRoundService,
    private readonly gameGateway: CahGameGateway,
  ) {}

  @Post('start')
  async startGame(@Param('code') code: string, @Body() dto: StartGameDto) {
    const { session, round } = await this.roundService.startGame(code, dto);

    const fullRound = await this.roundService.getCurrentRound(code);

    this.gameGateway.emitGameStarted(
      code,
      {
        roundId: round.round_id,
        roundNumber: round.round_number,
        promptCard: {
          cardId: fullRound!.prompt_card!.card_id,
          text: fullRound!.prompt_card!.card_text,
          pick: fullRound!.prompt_card!.pick || 1,
        },
        judgePlayerId: round.judge_player_id,
        status: round.status,
      },
      session.players.map((p) => ({
        playerId: p.session_player_id,
        nickname: p.nickname,
        score: p.score,
        isHost: p.is_host,
        isConnected: p.is_connected,
      })),
    );

    return {
      sessionId: session.session_id,
      status: session.status,
      currentRound: session.current_round,
      round: {
        roundId: round.round_id,
        roundNumber: round.round_number,
        promptCardId: round.prompt_card_id,
        judgePlayerId: round.judge_player_id,
        status: round.status,
      },
    };
  }

  @Get('round/current')
  async getCurrentRound(@Param('code') code: string) {
    const round = await this.roundService.getCurrentRound(code);

    if (!round) {
      return { round: null };
    }

    return {
      round: {
        roundId: round.round_id,
        roundNumber: round.round_number,
        promptCard: {
          cardId: round.prompt_card!.card_id,
          text: round.prompt_card!.card_text,
          pick: round.prompt_card!.pick || 1,
          draw: round.prompt_card!.draw,
        },
        judge: {
          playerId: round.judge.session_player_id,
          nickname: round.judge.nickname,
        },
        status: round.status,
        submissions: round.submissions.map((s) => ({
          submissionId: s.submission_id,
          playerId: s.session_player_id,
          playerNickname: s.player.nickname,
          cards:
            round.status === 'judging' || round.status === 'complete'
              ? s.cards
                  .filter((c) => c.card !== null)
                  .sort((a, b) => a.card_order - b.card_order)
                  .map((c) => ({
                    cardId: c.card!.card_id,
                    text: c.card!.card_text,
                  }))
              : undefined,
          submittedAt: s.submitted_at,
        })),
        winnerPlayerId: round.winner_player_id,
      },
    };
  }

  @Post('round/:roundId/submit')
  async submitCards(
    @Param('code') code: string,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() dto: SubmitCardsDto,
  ) {
    const submission = await this.roundService.submitCards(code, roundId, dto);

    const currentRound = await this.roundService.getCurrentRound(code);
    if (currentRound) {
      const totalPlayers =
        currentRound.submissions.length +
        (currentRound.status === 'submissions' ? 1 : 0);

      this.gameGateway.emitCardSubmitted(
        code,
        dto.playerId,
        currentRound.submissions.length,
        totalPlayers,
      );

      if (currentRound.status === 'judging') {
        this.gameGateway.emitJudgingStarted(
          code,
          currentRound.submissions.map((s) => ({
            submissionId: s.submission_id,
            playerId: s.session_player_id,
            cards: s.cards
              .filter((c) => c.card !== null)
              .sort((a, b) => a.card_order - b.card_order)
              .map((c) => ({
                cardId: c.card!.card_id,
                text: c.card!.card_text,
              })),
          })),
        );
      }
    }

    return {
      submissionId: submission.submission_id,
      roundId: submission.round_id,
      playerId: submission.session_player_id,
      submittedAt: submission.submitted_at,
    };
  }

  @Post('round/:roundId/judge')
  async selectWinner(
    @Param('code') code: string,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Body() dto: SelectWinnerDto,
  ) {
    const { round, winner, gameOver, nextRound } =
      await this.roundService.selectWinner(code, roundId, dto);

    const previousRound = await this.roundService.getCurrentRound(code);
    const winningSubmission = previousRound?.submissions.find(
      (s) => s.session_player_id === winner.session_player_id,
    );

    const players = previousRound
      ? previousRound.submissions.map((s) => ({
          playerId: s.player.session_player_id,
          nickname: s.player.nickname,
          score: s.player.score,
          isHost: false,
          isConnected: true,
        }))
      : [];

    this.gameGateway.emitWinnerSelected(
      code,
      {
        submissionId: dto.winningSubmissionId,
        playerId: winner.session_player_id,
        cards: winningSubmission?.cards
          .filter((c) => c.card !== null)
          .sort((a, b) => a.card_order - b.card_order)
          .map((c) => ({
            cardId: c.card!.card_id,
            text: c.card!.card_text,
          })),
      },
      winner.session_player_id,
      winner.nickname,
      players,
      gameOver,
    );

    if (gameOver) {
      this.gameGateway.emitGameEnded(
        code,
        winner.session_player_id,
        winner.nickname,
        players,
      );
    } else if (nextRound) {
      const fullNextRound = await this.roundService.getCurrentRound(code);
      if (fullNextRound) {
        this.gameGateway.emitNextRound(code, {
          roundId: nextRound.round_id,
          roundNumber: nextRound.round_number,
          promptCard: {
            cardId: fullNextRound.prompt_card!.card_id,
            text: fullNextRound.prompt_card!.card_text,
            pick: fullNextRound.prompt_card!.pick || 1,
          },
          judgePlayerId: nextRound.judge_player_id,
          status: nextRound.status,
        });
      }
    }

    return {
      round: {
        roundId: round.round_id,
        status: round.status,
        winnerPlayerId: round.winner_player_id,
      },
      winner: {
        playerId: winner.session_player_id,
        nickname: winner.nickname,
        score: winner.score,
      },
      gameOver,
      nextRound: nextRound
        ? {
            roundId: nextRound.round_id,
            roundNumber: nextRound.round_number,
            promptCardId: nextRound.prompt_card_id,
            judgePlayerId: nextRound.judge_player_id,
            status: nextRound.status,
          }
        : undefined,
    };
  }

  @Get('player/:playerId/hand')
  async getPlayerHand(
    @Param('code') code: string,
    @Param('playerId', ParseIntPipe) playerId: number,
  ) {
    const hand = await this.roundService.getPlayerHand(code, playerId);

    return {
      playerId,
      cards: hand
        .filter((h) => h.card !== null)
        .map((h) => ({
          cardId: h.card!.card_id,
          text: h.card!.card_text,
        })),
    };
  }
}
