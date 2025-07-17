import { Command, CommandRunner, Option } from 'nest-commander';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Umzug } from 'umzug';

@Command({
  name: 'make:migration',
  description: 'Create a new migration file',
})
export class MakeMigrationCommand extends CommandRunner {
  run(passedParams: string[], options?: Record<string, any>): Promise<void> {
    console.log('make:migration', passedParams, options);

    const umzug = new Umzug({
      migrations: {
        glob: `${process.cwd()}/src/database/migrations/*.ts`,
      },
      create: {
        folder: `${process.cwd()}/src/database/migrations`,
      },
      logger: console,
    });
    const migrationStub = readFileSync(
      join(
        process.cwd(),
        'src',
        'cli-commands',
        'commands',
        'migration',
        'migration.stub',
      ),
      'utf-8',
    );

    const withMillis = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, '')
      .slice(0, 17);

    return umzug.create({
      name: withMillis + '-' + options?.name + '.ts',
      allowConfusingOrdering: true,
      content: migrationStub,
      prefix: 'NONE',
    });
  }
  @Option({
    flags: '-n, --name <name>',
    description: 'Name of the migration file',
    required: true,
  })
  private name(val: string): string {
    return val;
  }
}
