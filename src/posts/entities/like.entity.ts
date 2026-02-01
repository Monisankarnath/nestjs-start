import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';

@Entity()
// 🛡️ SECURITY: This ensures a user can only like a specific post ONCE.
// Postgres will throw an error if you try to insert { userId: 1, postId: 5 } twice.
@Unique(['user', 'post'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Post)
  post: Post;
}
