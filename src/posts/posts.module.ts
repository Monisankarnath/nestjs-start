import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';
import { StreamService } from './providers/stream.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Like])],
  controllers: [PostsController],
  providers: [PostsService, StreamService],
})
export class PostsModule {}
