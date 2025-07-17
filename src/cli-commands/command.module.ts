import { Module } from '@nestjs/common';
import { MakeMigrationCommand } from './commands/migration/make-migration.command';
import { RunMigrationCommand } from './commands/migration/run-migration.command';

@Module({
  providers: [MakeMigrationCommand, RunMigrationCommand],
})
export class CommandModule {}
