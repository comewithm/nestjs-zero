import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
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

  // 点赞的文章 多对多
  @ManyToMany(() => Article, (article) => article.favoritedBy)
  favoritedArticles: Article[];

  // 关注关系: 多对多
  @ManyToMany(() => User, (user) => user.followers)
  @JoinTable({
    name: 'user_follows',
    joinColumn: {
      name: 'followerId', // 当前用户(关注者)的外键
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'followingId', // 被关注用户的外键
      referencedColumnName: 'id',
    },
  })
  following: User[]; // 当前用户关注的人

  // 反向关系，关注当前用户的人
  @ManyToMany(() => User, (user) => user.following)
  followers: User[]; // 关注当前用户的人
}
