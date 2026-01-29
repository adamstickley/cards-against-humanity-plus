import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities';
import { SyncUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
}
