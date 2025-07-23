import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { EnvironmentModule } from './environment/environment.module';
import { CommandModule } from './cli-commands/command.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module.';
import { DashboardController } from './dashboard/controllers/dashboard/dashboard.controller';

@Module({
  imports: [
    DatabaseModule,
    EnvironmentModule,
    CommandModule,
    UsersModule,
    AuthModule,
    DashboardModule,
  ],
  controllers: [AppController, DashboardController],
  providers: [AppService],
})
export class AppModule {}
