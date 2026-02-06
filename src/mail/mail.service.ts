import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail-queue') private mailQueue: Queue) {}

  async sendUserWelcome(user: any) {
    // Add job to Redis.
    // 'welcome-email' is the job name.
    // user is the payload.
    await this.mailQueue.add('welcome-email', {
      email: user.email,
      name: user.firstName,
    });
    console.log(`Job added to queue for ${user.email}`);
  }
}
