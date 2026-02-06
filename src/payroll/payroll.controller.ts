import { Controller, Post, Body } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('payroll')
export class PayrollController {
  constructor(@InjectQueue('payroll-queue') private payrollQueue: Queue) {}

  @Post('process')
  async processPayroll(@Body() body: { employeeIds: number[] }) {
    // 1. Receive list of 1000 employees
    const employees = body.employeeIds;

    console.log(
      `👨‍💼 Admin requested payroll for ${employees.length} employees.`,
    );

    // 2. Add jobs to the queue
    // We loop and add individual jobs so they can be processed in parallel
    const jobs = employees.map((id) => ({
      name: 'calculate-salary',
      data: { employeeId: id, taxYear: 2024 },
      opts: { attempts: 3, backoff: 5000 }, // Retry 3 times if it fails
    }));

    await this.payrollQueue.addBulk(jobs);

    // 3. Return response INSTANTLY
    return {
      message: 'Payroll processing started successfully.',
      jobCount: jobs.length,
      status: 'queued',
    };
  }
}
