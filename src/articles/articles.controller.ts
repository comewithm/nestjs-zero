import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import type { CreateArticleDto, UpdateArticleDto } from './articles.service';
import { UsersService } from '../users/users.service';
import { Article } from './articles.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesServices: ArticlesService,
    private readonly usersService: UsersService,
  ) {}

  // 创建文章
  @Post()
  @UseGuards(JwtAuthGuard) // 应用认证守卫
  async create(@Body() createArticleDto: any, @CurrentUser() author: User): Promise<Article> {
    // 注意：现在需要从req.user获取当前登录用户
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    return await this.articlesServices.create(createArticleDto, author);
  }

  @Get()
  async findAll(): Promise<Article[]> {
    return await this.articlesServices.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Article> {
    const article = await this.articlesServices.findOne(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    return await this.articlesServices.update(id, updateArticleDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.articlesServices.remove(id);
    return {
      message: 'Article deleted successfully',
    };
  }
}
