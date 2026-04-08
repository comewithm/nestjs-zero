import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  // 获取用户资料
  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  async getProfile(
    @Param('username') username: string,
    @CurrentUser() currentUser?: User,
  ): Promise<{ profile: any }> {
    const user = await this.profileService.findByUsername(username);

    // 判断是否关注
    let following = false;

    if (currentUser) {
      following = await this.profileService.isFollowing(
        currentUser.id,
        username,
      );
    }

    return {
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following, // 根据当前用户判断
      },
    };
  }

  // 关注用户
  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  async followUser(
    @Param('username') username: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ profile: any }> {
    const user = await this.profileService.followUser(currentUser.id, username);

    return {
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following: true,
      },
    };
  }

  // 取消关注用户
  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Param('username') username: string,
    @CurrentUser() currentUser: User,
  ): Promise<{ profile: any }> {
    const user = await this.profileService.unfollowUser(
      currentUser.id,
      username,
    );

    return {
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following: false,
      },
    };
  }
}
