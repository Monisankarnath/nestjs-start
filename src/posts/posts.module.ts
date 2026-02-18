import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';
import { StreamService } from './providers/stream.service';
import { VideoProcessor } from './providers/video.processor';
import { BullModule } from '@nestjs/bullmq';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Like, User]),
    BullModule.registerQueue({
      name: 'video',
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService, StreamService, VideoProcessor],
})
export class PostsModule {}
