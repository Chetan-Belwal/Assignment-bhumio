import { Module } from '@nestjs/common';
import { MakeMigrationCommand } from './commands/migration/make-migration.command';
import { RunMigrationCommand } from './commands/migration/run-migration.command';
import { RollbackMigrationCommand } from './commands/migration/rollback-migration.command';

@Module({
  providers: [
    MakeMigrationCommand,
    RunMigrationCommand,
    RollbackMigrationCommand,
  ],
})
export class CommandModule {}
