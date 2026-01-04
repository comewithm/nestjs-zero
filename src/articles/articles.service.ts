import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './articles.entity';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { QueryArticlesDto } from './dto/query-articles.dto';

export interface CreateArticleDto {
  title: string;
  body: string;
  slug: string;
  authorId: number;
}

export interface UpdateArticleDto {
  title?: string;
  body?: string;
  slug?: string;
}

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 创建文章
  async create(
    createArticleDto: CreateArticleDto,
    author: User,
  ): Promise<Article> {
    const article = this.articleRepository.create({
      ...createArticleDto,
      author,
    });

    return await this.articleRepository.save(article);
  }

  // 查询所有文章(包含作者信息)
  async findAll(queryDto: QueryArticlesDto) {
    const {
      limit = 20,
      offset = 0,
      author,
      orderBy = 'createdAt',
      order = 'DESC',
    } = queryDto;

    // 创建查询构建器
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author') // 关联作者信息
      .leftJoinAndSelect('article.favoritedBy', 'favoritedBy'); // 加载点赞用户

    if (author) {
      queryBuilder.where('author.username = :username', { username: author });
    }

    // 排序
    queryBuilder.orderBy(`article.${orderBy}`, order);

    // 分页
    queryBuilder.skip(offset).take(limit);

    // 执行查询
    const [articles, total] = await queryBuilder.getManyAndCount();

    return {
      articles,
      total,
      limit,
      offset,
    };
  }

  // 根据ID查找文章(包含作者信息)
  async findOne(id: number): Promise<Article | null> {
    return await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async findBySlug(slug: string): Promise<Article | null> {
    return await this.articleRepository.findOne({
      where: { slug },
      relations: ['author', 'favoritedBy'], // 加载作者和点赞用户
    });
  }

  // 更新文章
  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    await this.articleRepository.update(id, updateArticleDto);

    const updatedArticle = await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!updatedArticle) {
      throw new Error('Article not found');
    }

    return updatedArticle;
  }

  // 删除文章
  async remove(id: number): Promise<void> {
    await this.articleRepository.delete(id);
  }

  async favoriteArticle(articleId: number, userId: number): Promise<Article> {
    // 1.查找文章
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['favoritedBy'], // 加载点赞用户列表
    });

    if (!article) {
      throw new Error('Article not found');
    }

    // 2.查找用户
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 3.检查是否已经点赞
    const isFavorited = article.favoritedBy.some((u) => u.id === userId);
    if (isFavorited) {
      return article;
    }

    // 4.添加点赞关系
    article.favoritedBy.push(user);
    return await this.articleRepository.save(article);
  }

  async unfavoriteArticle(articleId: number, userId: number): Promise<Article> {
    // 1.查找文章
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
      relations: ['favoritedBy'],
    });

    if (!article) {
      throw new Error('Article not found');
    }

    article.favoritedBy = article.favoritedBy.filter((u) => u.id !== userId);
    return await this.articleRepository.save(article);
  }
}
