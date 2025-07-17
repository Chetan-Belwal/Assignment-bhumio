import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { EnvironmentModule } from './environment/environment.module';
import { CommandModule } from './cli-commands/command.module';

@Module({
  imports: [DatabaseModule, EnvironmentModule, CommandModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
