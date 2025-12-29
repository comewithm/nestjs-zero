import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Article } from '../articles/articles.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() // 主键，自动递增
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  }) // 普通列
  email: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  password: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  bio: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  image: string | null;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];
}
