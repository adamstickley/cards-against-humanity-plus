import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserPreferencesEntity } from '../../entities';
import { SyncUserDto, UpdatePreferencesDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserPreferencesEntity)
    private readonly preferencesRepository: Repository<UserPreferencesEntity>,
  ) {}

  async syncUser(dto: SyncUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { clerk_user_id: dto.clerkUserId },
    });

    if (existingUser) {
      existingUser.email = dto.email ?? existingUser.email;
      existingUser.display_name = dto.displayName ?? existingUser.display_name;
      existingUser.avatar_url = dto.avatarUrl ?? existingUser.avatar_url;
      return this.userRepository.save(existingUser);
    }

    const newUser = this.userRepository.create({
      clerk_user_id: dto.clerkUserId,
      email: dto.email,
      display_name: dto.displayName,
      avatar_url: dto.avatarUrl,
    });

    return this.userRepository.save(newUser);
  }

  async getUser(clerkUserId: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { clerk_user_id: clerkUserId },
    });
  }

  async updateDisplayName(
    clerkUserId: string,
    displayName: string,
  ): Promise<UserEntity | null> {
    const user = await this.getUser(clerkUserId);
    if (!user) {
      return null;
    }

    user.display_name = displayName;
    return this.userRepository.save(user);
  }

  async getPreferences(
    clerkUserId: string,
  ): Promise<UserPreferencesEntity | null> {
    return this.preferencesRepository.findOne({
      where: { clerk_user_id: clerkUserId },
    });
  }

  async updatePreferences(
    clerkUserId: string,
    dto: UpdatePreferencesDto,
  ): Promise<UserPreferencesEntity> {
    let preferences = await this.preferencesRepository.findOne({
      where: { clerk_user_id: clerkUserId },
    });

    if (!preferences) {
      preferences = this.preferencesRepository.create({
        clerk_user_id: clerkUserId,
      });
    }

    if (dto.preferredNickname !== undefined) {
      preferences.preferred_nickname = dto.preferredNickname;
    }
    if (dto.defaultScoreToWin !== undefined) {
      preferences.default_score_to_win = dto.defaultScoreToWin;
    }
    if (dto.defaultMaxPlayers !== undefined) {
      preferences.default_max_players = dto.defaultMaxPlayers;
    }
    if (dto.defaultCardsPerHand !== undefined) {
      preferences.default_cards_per_hand = dto.defaultCardsPerHand;
    }
    if (dto.defaultRoundTimerSeconds !== undefined) {
      preferences.default_round_timer_seconds = dto.defaultRoundTimerSeconds;
    }

    return this.preferencesRepository.save(preferences);
  }
}
