import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import type {CreateArticleDto, UpdateArticleDto} from './articles.service'
import { UsersService } from "./users.service";
import { Article } from "./articles.entity";


@Controller('articles')
export class ArticlesController {
    constructor(
        private readonly articlesServices: ArticlesService,
        private readonly usersService: UsersService
    ) {}

    // 创建文章
    @Post()
    async create(
        @Body() createArticleDto: CreateArticleDto
    ): Promise<Article> {
        const author = await this.usersService.findOne(createArticleDto.authorId)

        if(!author) {
            throw new NotFoundException('Author not found')
        }

        return await this.articlesServices.create(createArticleDto, author)
    }

    @Get()
    async findAll(): Promise<Article[]> {
        return await this.articlesServices.findAll();
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number
    ): Promise<Article> {
        const article = await this.articlesServices.findOne(id)

        if(!article) {
            throw new NotFoundException('Article not found')
        }

        return article
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateArticleDto: UpdateArticleDto
    ): Promise<Article> {
        return await this.articlesServices.update(id, updateArticleDto)
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{message: string}> {
        await this.articlesServices.remove(id)
        return {
            message: 'Article deleted successfully'
        }
    }
}