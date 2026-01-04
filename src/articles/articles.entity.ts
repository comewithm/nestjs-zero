import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  // 作者关系：多对一(多个文章属于一个用户)
  @ManyToOne(() => User, (user) => user.articles) // 关系定义
  @JoinColumn({ name: 'authorId', referencedColumnName: 'id' }) // 指定外键列名
  author: User;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.favoritedArticles)
  @JoinTable({
    name: 'article_favorites', // 中间表名称
    joinColumn: {
      name: 'articleId',
      referencedColumnName: 'id',
    }, // 当前表的外键
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    }, // 关联表的外键
  })
  favoritedBy: User[];
}
