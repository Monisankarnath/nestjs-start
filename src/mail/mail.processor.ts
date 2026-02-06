import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'welcome-email':
        await this.sendWelcomeEmail(job);
        break;
      default:
        console.log('Unknown job:', job.name);
    }
  }

  private async sendWelcomeEmail(job: Job) {
    console.log(`[Worker] Start sending email to ${job.data.email}...`);

    // Simulate heavy work (taking 3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log(`[Worker] ✅ Email sent to ${job.data.email}`);
  }
}
