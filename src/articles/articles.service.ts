import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Article } from "./articles.entity";
import { Repository } from "typeorm";
import { User } from "../users/users.entity";


export interface CreateArticleDto {
    title: string
    body: string
    slug: string
    authorId: number
}

export interface UpdateArticleDto {
    title?: string
    body?: string
    slug?: string
}

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>
    ) {}

    // 创建文章
    async create(
        createArticleDto: CreateArticleDto,
        author: User
    ): Promise<Article> {
        const article = this.articleRepository.create({
            ...createArticleDto,
            author
        })

        return await this.articleRepository.save(article)
    }

    // 查询所有文章(包含作者信息)
    async findAll(): Promise<Article[]> {
        return await this.articleRepository.find({
            relations: ['author'], // 加载关联的作者信息
        })
    }

    // 根据ID查找文章(包含作者信息)
    async findOne(id: number): Promise<Article | null> {
        return await this.articleRepository.findOne({
            where: {id},
            relations: ['author']
        })
    }

    // 更新文章
    async update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
        await this.articleRepository.update(id, updateArticleDto)

        const updatedArticle = await this.articleRepository.findOne({
            where: {id},
            relations: ['author']
        })

        if(!updatedArticle) {
            throw new Error('Article not found')
        }

        return updatedArticle
    }

    // 删除文章
    async remove(id: number): Promise<void> {
        await this.articleRepository.delete(id)
    }
}