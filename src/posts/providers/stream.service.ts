import { Injectable } from '@nestjs/common';
import { KinesisClient, PutRecordCommand } from '@aws-sdk/client-kinesis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StreamService {
  private client: KinesisClient;
  private streamName: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new KinesisClient({
      region: this.configService.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY') || 'fake',
        secretAccessKey: this.configService.get('AWS_SECRET_KEY') || 'fake',
      },
    });
    this.streamName = 'MyPostViewsStream';
  }

  /**
   * Pushes a log to the cloud.
   * "Fire and Forget" from the API's perspective, but "Durable" in the Cloud.
   */
  async pushLog(userId: string, postId: number) {
    const payload = JSON.stringify({
      event: 'POST_VIEW',
      userId,
      postId,
      timestamp: new Date().toISOString(),
    });

    const command = new PutRecordCommand({
      StreamName: this.streamName,
      Data: Buffer.from(payload),
      // PARTITION KEY: Crucial Concept
      // All events for the same "Post" go to the same "Shard" (Lane).
      // This ensures if we are counting views, we don't have race conditions across shards.
      PartitionKey: String(postId),
    });

    try {
      // In real production, you might not await this to keep API fast,
      // or you would offload it to a queue.
      await this.client.send(command);
      console.log(`✅ Log pushed to Stream for Post ${postId}`);
    } catch (error) {
      console.error('❌ Stream Error (Simulation):', error.message);
    }
  }
}
