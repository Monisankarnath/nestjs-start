import { Processor, WorkerHost } from '@nestjs/bullmq'; // 👈 Import WorkerHost, remove Process
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from '../entities/post.entity';
import * as fs from 'fs';
import * as path from 'path';
import Ffmpeg from 'fluent-ffmpeg';

@Processor('video')
export class VideoProcessor extends WorkerHost {
  // 👈 MUST extend WorkerHost
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {
    super(); // 👈 Call super() because we extend a class
  }

  // The WorkerHost calls this method automatically for EVERY job
  async process(job: Job): Promise<any> {
    // 1. Check Job Name (Safety Check)
    if (job.name !== 'transcode') {
      console.log(`[VideoProcessor] Unknown job: ${job.name}`);
      return;
    }

    const { postId, file } = job.data;
    console.log(`[VideoProcessor] 🎬 Start transcoding Post #${postId}`);
    console.log(`[VideoProcessor] File Path: ${file.path}`);

    try {
      // 2. Setup paths
      const outputDir = path.join(
        process.cwd(),
        'uploads',
        'hls',
        postId.toString(),
      );
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const masterPlaylistPath = path.join(outputDir, 'index.m3u8');

      // 3. Run FFmpeg
      await new Promise((resolve, reject) => {
        Ffmpeg(file.path)
          .outputOptions([
            '-hls_time 10', // 10-second chunks
            '-hls_list_size 0', // Keep all chunks in the list
            '-f hls', // Format: HLS
          ])
          .output(masterPlaylistPath)
          .on('end', () => {
            console.log('[FFmpeg] ✅ Transcoding finished!');
            resolve(true);
          })
          .on('error', (err) => {
            console.error('[FFmpeg] ❌ Error:', err);
            reject(err);
          })
          .run();
      });

      // 4. Update Database
      const relativeUrl = `/uploads/hls/${postId}/index.m3u8`;

      await this.postsRepository.update(postId, {
        status: PostStatus.PUBLISHED,
        url: relativeUrl,
      });

      console.log(
        `[VideoProcessor] 🚀 Post #${postId} is live at ${relativeUrl}`,
      );

      // Optional: Cleanup raw file
      // fs.unlinkSync(file.path);
    } catch (error) {
      console.error('[VideoProcessor] Failed:', error);
      await this.postsRepository.update(postId, { status: PostStatus.DRAFT });
      throw error; // Make sure BullMQ knows it failed
    }
  }
}
