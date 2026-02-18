import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, Like, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post, PostStatus, PostType } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Tag } from '../tags/entities/tag.entity';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InjectRepository } from '@nestjs/typeorm';
import { GetPostDto } from './dto/get-posts.dto';
import { CreateVideoPostDto } from './dto/create-video-post.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class PostsService {
  private supabase: SupabaseClient;
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @InjectQueue('video')
    private readonly videoQueue: Queue,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') ?? '';
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY') ?? '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('DEBUG SUPABASE URL:', supabaseUrl);
    console.log(
      'DEBUG SUPABASE KEY:',
      supabaseKey ? 'Key exists' : 'Key missing',
    );
  }
  async create(
    createPostDto: CreatePostDto,
    userId: string,
    file: Express.Multer.File,
  ) {
    const bucket: string =
      this.configService.get<string>('SUPABASE_BUCKET') ?? '';

    // 🔍 DEBUG LOG 1: Check Config
    console.log('--- DEBUG START ---');
    console.log('Target Bucket:', bucket);
    console.log('User ID:', userId);
    console.log('File Size:', file.size);

    // 🔍 DEBUG LOG 2: Test Connection by Listing Buckets
    // If this fails, your URL or KEY is wrong.
    const { data: buckets, error: listError } =
      await this.supabase.storage.listBuckets();

    if (listError) {
      console.error(
        '❌ FATAL: Could not list buckets. Check URL/KEY.',
        listError,
      );
      throw new InternalServerErrorException('Supabase Connection Failed');
    }

    // Check if our bucket is in the list
    const bucketExists = buckets?.find((b) => b.name === bucket);
    console.log(
      '✅ Connection OK. Available Buckets:',
      buckets?.map((b) => b.name),
    );

    if (!bucketExists) {
      console.error(
        `❌ FATAL: Bucket "${bucket}" does not exist in this Supabase project.`,
      );
      throw new InternalServerErrorException(`Bucket ${bucket} not found`);
    }

    // ---------------------------------------------------
    // PHASE 1: Upload to Supabase Storage
    // ---------------------------------------------------
    const filePath = `${userId}/${Date.now()}-${file.originalname}`;

    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from(bucket) // <--- uses the variable we just checked
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Upload Error Details:', uploadError);
      throw new BadRequestException(`Upload Failed: ${uploadError.message}`);
    }

    console.log('✅ Upload Success:', uploadData);

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucket).getPublicUrl(filePath);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step A: Handle Tags (Deduping Logic)
      const tagList: Tag[] = [];
      if (createPostDto.tags && createPostDto.tags.length > 0) {
        for (const tagName of createPostDto.tags) {
          // Check if tag exists (inside transaction)
          let tag = await queryRunner.manager.findOne(Tag, {
            where: { name: tagName },
          });
          if (!tag) {
            tag = queryRunner.manager.create(Tag, { name: tagName });
            tag = await queryRunner.manager.save(tag);
          }
          tagList.push(tag);
        }
      }

      // Step B: Create Post
      const post = queryRunner.manager.create(Post, {
        ...createPostDto,
        url: publicUrl,
        user: { id: userId },
        tags: tagList,
      });
      const savedPost = await queryRunner.manager.save(post);

      // Step C: Increment User Count
      await queryRunner.manager.increment(
        User,
        { id: userId },
        'postsCount',
        1,
      );

      // Step D: Commit
      await queryRunner.commitTransaction();

      return savedPost;
    } catch (dbError) {
      // ---------------------------------------------------
      // PHASE 3: Compensation (Cleanup)
      // ---------------------------------------------------
      // The DB failed, so we MUST delete the file we just uploaded.
      // Otherwise, we have a "Ghost File" costing us money.

      console.error('DB Transaction Failed. Deleting file...', dbError);

      await queryRunner.rollbackTransaction(); // Undo DB changes

      // Delete file from Supabase
      await this.supabase.storage.from(bucket).remove([filePath]);

      throw new InternalServerErrorException(
        'Post creation failed, file upload rolled back.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(getPostDto: GetPostDto) {
    const { page, limit, search } = getPostDto;
    console.log('--- PAGINATION DEBUG ---');
    console.log('Page:', page, typeof page); // Should be: 1 'number'
    console.log('Limit:', limit, typeof limit); // Should be: 2 'number'
    const skip = ((page ?? 1) - 1) * (limit ?? 10);
    const whereCondition = search ? { title: Like(`%${search}%`) } : {};

    const [data, total] = await this.postRepository.findAndCount({
      where: whereCondition,
      take: limit,
      skip: skip,
      // relations: ['user', 'tags', 'comments'],
      order: { createdAt: 'DESC' },
    });
    const lastPage = Math.ceil(total / (limit ?? 10));

    return {
      data,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async remove(id: string, userId: string) {
    // 1. Find the post (and the author)
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) throw new NotFoundException('Post not found');

    // 2. CHECK OWNERSHIP 🛡️
    // Is the person requesting (userId) the same as the author (post.user.id)?
    if (post.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // 3. Delete file from Supabase (Cleanup)
    // Extract the path from the URL to delete it from storage bucket
    // URL: https://xyz.supabase.co/.../public/posts/USER_ID/FILENAME.png
    const fileName = post.url.split('/').pop(); // Gets 'FILENAME.png'
    if (fileName) {
      await this.supabase.storage
        .from(this.configService.get<string>('SUPABASE_BUCKET') ?? '')
        .remove([`${userId}/${fileName}`]);
    }

    // 4. Delete from DB
    return this.postRepository.remove(post);
  }

  async findOne(id: string) {
    return this.postRepository.findOne({ where: { id } });
  }

  async createVideoPost(
    createVideoDto: CreateVideoPostDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    // 1. Create the new Post Entity
    // We strictly set the type to VIDEO and status to PROCESSING
    const newPost = this.postRepository.create({
      title: createVideoDto.title,
      content: createVideoDto.content,
      type: PostType.VIDEO,
      status: PostStatus.PROCESSING,
      url: file.path, // Initially, this saves the LOCAL path (uploads/temp/xyz.mp4)
      thumbnailUrl: '', // Will be updated after transcoding
      user: { id: userId } as User,
    });

    // 2. Save to Postgres
    const savedPost = await this.postRepository.save(newPost);

    // 3. TODO: Trigger Background Job here (Day 6 Part 2)
    await this.videoQueue.add('transcode', {
      postId: savedPost.id,
      file: file,
    });

    return {
      message: 'Video upload started. Transcoding in progress.',
      postId: savedPost.id,
      status: 'PROCESSING',
    };
  }
}
