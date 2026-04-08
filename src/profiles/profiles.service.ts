import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 根据用户名获取用户资料
  async findByUsername(
    username: string,
    currentUserId?: number,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['articles'], // 加载用户的文章
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // 关注用户
  async followUser(
    followerId: number,
    followingUsername: string,
  ): Promise<User> {
    // 1.查找被关注的用户
    const followingUser = await this.userRepository.findOne({
      where: { username: followingUsername },
      relations: ['followers'], // 关注者列表
    });

    if (!followingUser) {
      throw new NotFoundException('User not found');
    }

    // 2.查找关注者
    const follower = await this.userRepository.findOne({
      where: { id: followerId },
      relations: ['following'], // 加载关注列表
    });

    if (!follower) {
      throw new NotFoundException('Follower not found');
    }

    if (follower.id === followingUser.id) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // 3.判断是否已存在关注者
    const isFollowing = follower.following.some(
      (u) => u.id === followingUser.id,
    );
    if (isFollowing) {
      // 已关注，直接返回
      return followingUser;
    }

    // 4.添加关注关系
    follower.following.push(followingUser);
    await this.userRepository.save(follower);

    return followingUser;
  }

  // 取消关注
  async unfollowUser(
    followerId: number,
    followingUsername: string,
  ): Promise<User> {
    // 1.查找被关注的用户
    const followingUser = await this.userRepository.findOne({
      where: { username: followingUsername },
      relations: ['followers'], // 关注者列表
    });

    if (!followingUser) {
      throw new NotFoundException('User not found');
    }

    // 2.查找关注者
    const follower = await this.userRepository.findOne({
      where: { id: followerId },
      relations: ['following'], // 加载关注列表
    });

    if (!follower) {
      throw new NotFoundException('Follower not found');
    }

    if (follower.id === followingUser.id) {
      throw new BadRequestException('You cannot unfollow yourself');
    }

    // 3.直接过滤掉关注者
    follower.following = follower.following.filter(
      (u) => u.id !== followingUser.id,
    );
    await this.userRepository.save(follower);

    return followingUser;
  }

  // 是否已关注
  async isFollowing(followerId: number, followingUsername: string) {
    const follower = await this.userRepository.findOne({
      where: { id: followerId },
      relations: ['following'], // 加载关注列表
    });

    if (!follower) {
      return false;
    }

    const followingUser = await this.userRepository.findOne({
      where: { username: followingUsername },
    });

    if (!followingUser) {
      return false;
    }

    // 检查关注列表中是否包含该用户
    return follower.following.some((u) => u.id === followingUser.id);
  }
}
