import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CahGameRoundService } from './cah-game-round.service';
import { StartGameDto, SubmitCardsDto, SelectWinnerDto } from './dto';

@Controller('session/:code/game')
export class CahGameRoundController {
  constructor(private readonly roundService: CahGameRoundService) {}

  @Post('start')
  async startGame(@Param('code') code: string, @Body() dto: StartGameDto) {
    const { session, round } = await this.roundService.startGame(code, dto);
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
          cardId: round.prompt_card.card_id,
          text: round.prompt_card.card_text,
          pick: round.prompt_card.pick || 1,
          draw: round.prompt_card.draw,
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
                  .sort((a, b) => a.card_order - b.card_order)
                  .map((c) => ({
                    cardId: c.card.card_id,
                    text: c.card.card_text,
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
      cards: hand.map((h) => ({
        cardId: h.card.card_id,
        text: h.card.card_text,
      })),
    };
  }
}
