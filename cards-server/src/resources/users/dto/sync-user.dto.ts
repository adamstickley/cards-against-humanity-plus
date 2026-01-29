import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SyncUserDto {
  @IsString()
  @MaxLength(100)
  clerkUserId: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}
