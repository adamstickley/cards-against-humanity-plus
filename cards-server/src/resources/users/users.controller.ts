import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SyncUserDto } from './dto';

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
}
