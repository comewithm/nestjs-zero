import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './tags.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  // 根据名称查找标签
  async findByName(name: string): Promise<Tag | null> {
    return await this.tagRepository.findOne({ where: { name } });
  }

  // 创建标签(不存在则创建，存在则返回)
  async findOrCreate(name: string): Promise<Tag> {
    // 1.先查找标签是否存在
    let tag = await this.findByName(name);

    if (!tag) {
      tag = this.tagRepository.create({ name });
      tag = await this.tagRepository.save(tag);
    }

    return tag;
  }

  // 获取所有标签
  async findAll(): Promise<Tag[]> {
    return await this.tagRepository.find({ order: { name: 'ASC' } });
  }

  // 根据名称数组查找或创建标签
  async findOrCreateMany(tagNames: string[]): Promise<Tag[]> {
    let tags: Tag[] = [];
    for (const name of tagNames) {
      const tag = await this.findOrCreate(name);
      tags.push(tag);
    }

    return tags;
  }
}
