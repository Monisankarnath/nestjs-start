import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PayrollController } from './payroll.controller';
import { PayrollProcessor } from './payroll.processor';

@Module({
  imports: [
    // Register the specific queue for this module
    BullModule.registerQueue({
      name: 'payroll-queue',
    }),
  ],
  controllers: [PayrollController],
  providers: [PayrollProcessor],
})
export class PayrollModule {}
