import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('payroll-queue')
export class PayrollProcessor extends WorkerHost {
  // The Main Logic Function
  async process(job: Job): Promise<any> {
    const { employeeId } = job.data;

    console.log(`[Worker] ⚙️ Processing Salary for Employee #${employeeId}...`);

    // SIMULATION: Simulate complex math taking time (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // SIMULATION: Randomly fail specific employees to test Retry Logic
    if (employeeId === 999) {
      throw new Error('Database Connection Failed for User 999');
    }

    console.log(`[Worker] 💰 Salary Processed for Employee #${employeeId}`);
    return { status: 'success', paid: 5000 };
  }

  // --- EVENTS (Logs for Debugging) ---

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(
      `[Event] Job ${job.id} COMPLETED. Result: ${JSON.stringify(job.returnvalue)}`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.log(`[Event] ⚠️ Job ${job.id} FAILED. Reason: ${error.message}`);
  }
}
