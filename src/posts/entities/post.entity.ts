import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Like } from './like.entity';

export enum PostType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
}

export enum PostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  REVIEW = 'review',
  PUBLISHED = 'published',
  PROCESSING = 'processing',
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.IMAGE,
  })
  type: PostType;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column()
  url: string; // URL to S3 or Supabase Storage

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({ type: 'text', nullable: true })
  slug: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'json', nullable: true })
  metaOptions?: any;

  // ⚡ PERFORMANCE: Indexing 'userId'
  // Why? Because we often ask: "Show me all posts by User X"
  // Without index: Scans entire table (Slow).
  // With index: Jumps straight to User X's posts (Fast).
  @Index()
  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  // 🚀 OPTIMIZATION: Storing counts prevents expensive COUNT(*) queries later
  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // --- RELATIONS ---

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  // INTERNAL: @JoinTable() tells Postgres to create a hidden pivot table
  // named "post_tags_tag" to manage the Many-to-Many links.
  @ManyToMany(() => Tag, (tag) => tag.posts, {
    cascade: true, // Allows creating new tags directly when creating a post
  })
  @JoinTable()
  tags: Tag[];
}
