import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SyncUserDto, UpdatePreferencesDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  async syncUser(@Body() dto: SyncUserDto) {
    const user = await this.usersService.syncUser(dto);
    return {
      clerkUserId: user.clerk_user_id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  @Get(':clerkUserId')
  async getUser(@Param('clerkUserId') clerkUserId: string) {
    const user = await this.usersService.getUser(clerkUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      clerkUserId: user.clerk_user_id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  @Patch(':clerkUserId/display-name')
  async updateDisplayName(
    @Param('clerkUserId') clerkUserId: string,
    @Body('displayName') displayName: string,
  ) {
    const user = await this.usersService.updateDisplayName(
      clerkUserId,
      displayName,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      clerkUserId: user.clerk_user_id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      updatedAt: user.updated_at,
    };
  }

  @Get(':clerkUserId/preferences')
  async getPreferences(@Param('clerkUserId') clerkUserId: string) {
    const preferences = await this.usersService.getPreferences(clerkUserId);
    if (!preferences) {
      return {
        clerkUserId,
        preferredNickname: null,
        defaultScoreToWin: 8,
        defaultMaxPlayers: 10,
        defaultCardsPerHand: 10,
        defaultRoundTimerSeconds: null,
      };
    }
    return {
      clerkUserId: preferences.clerk_user_id,
      preferredNickname: preferences.preferred_nickname,
      defaultScoreToWin: preferences.default_score_to_win,
      defaultMaxPlayers: preferences.default_max_players,
      defaultCardsPerHand: preferences.default_cards_per_hand,
      defaultRoundTimerSeconds: preferences.default_round_timer_seconds,
      updatedAt: preferences.updated_at,
    };
  }

  @Put(':clerkUserId/preferences')
  async updatePreferences(
    @Param('clerkUserId') clerkUserId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    const preferences = await this.usersService.updatePreferences(
      clerkUserId,
      dto,
    );
    return {
      clerkUserId: preferences.clerk_user_id,
      preferredNickname: preferences.preferred_nickname,
      defaultScoreToWin: preferences.default_score_to_win,
      defaultMaxPlayers: preferences.default_max_players,
      defaultCardsPerHand: preferences.default_cards_per_hand,
      defaultRoundTimerSeconds: preferences.default_round_timer_seconds,
      updatedAt: preferences.updated_at,
    };
  }
}
