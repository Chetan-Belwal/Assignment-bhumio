import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { EnvironmentModule } from './environment/environment.module';
import { CommandModule } from './cli-commands/command.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FileManagementModule } from './file-management/file-management.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    DatabaseModule,
    EnvironmentModule,
    CommandModule,
    UsersModule,
    AuthModule,
    DashboardModule,
    FileManagementModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
