import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // 1. Load .env file
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Connect to Database (Async Mode)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule here so we can use it
      inject: [ConfigService], // Inject ConfigService to read variables
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),

        // AUTO-LOAD: Finds 'task.entity.ts' automatically
        autoLoadEntities: true,

        // SYNC: Creates tables automatically (Use only in Dev!)
        synchronize: true,

        // SSL: MANDATORY for Supabase/Neon/Cloud
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),

    TasksModule,
  ],
})
export class AppModule {}
