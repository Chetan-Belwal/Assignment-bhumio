/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { InjectConnection } from '@nestjs/sequelize';
import { Command, CommandRunner } from 'nest-commander';
import { Sequelize } from 'sequelize-typescript';
import { MigrationMeta, SequelizeStorage, Umzug } from 'umzug';

@Command({
  name: 'run:migration',
  description: 'Run the migrations',
})
export class RunMigrationCommand extends CommandRunner {
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
              import(path as string).then((migration) =>
                migration.up(context, this.connection.Sequelize),
              ),

            down: async () =>
              import(path as string).then((migration) =>
                migration.down(context, this.connection.Sequelize),
              ),
          };
        },
      },
      storage: new SequelizeStorage({ sequelize: this.connection }),
      logger: console,
    });

    const migrationsMeta: MigrationMeta[] = await umzug.up();

    if (migrationsMeta.length === 0) {
      console.log('No migrations to run');
    }
  }
}
