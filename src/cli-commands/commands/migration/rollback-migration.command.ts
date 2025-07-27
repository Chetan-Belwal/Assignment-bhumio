/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-unsafe-return */
import { InjectConnection } from '@nestjs/sequelize';
import { Command, CommandRunner } from 'nest-commander';
import { Sequelize } from 'sequelize-typescript';
import { MigrationMeta, SequelizeStorage, Umzug } from 'umzug';

@Command({
  name: 'rollback:migration',
  description: 'rollback the migrations',
})
export class RollbackMigrationCommand extends CommandRunner {
  constructor(@InjectConnection() private readonly connection: Sequelize) {
    super();
  }
  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const umzug = new Umzug({
      migrations: {
        glob: `${process.cwd()}/src/database/migrations/*.ts`,
        resolve: ({ path, name, context }) => {
          return {
            name,
            up: async () =>
              import(path).then((migration) =>
                migration.up(context, this.connection.Sequelize),
              ),

            down: async () =>
              import(path).then((migration) =>
                migration.down(context, this.connection.Sequelize),
              ),
          };
        },
      },
      storage: new SequelizeStorage({ sequelize: this.connection }),
      context: this.connection.getQueryInterface(),
      logger: console,
    });

    const migrationsMeta: MigrationMeta[] = await umzug.down();

    if (migrationsMeta.length === 0) {
      console.error('No migrations to rollback');
    }
  }
}
