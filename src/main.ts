import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as hbs from 'express-handlebars';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import * as flash from 'express-flash';
import * as session from 'express-session';
import { SessionConfig } from './environment/interfaces/session';
import { useContainer } from 'class-validator';
import * as FileStore from 'session-file-store';
import { PreviousUrlInterceptor } from './common/helpers/interceptors/previous-url.interceptor';
import { ValidationErrorFilter } from './common/filters/validation-error.filter';
import { SessionErrorInterceptor } from './common/helpers/interceptors/session-error.interceptor';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // View
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine(
    'hbs',
    hbs.engine({
      extname: 'hbs',
      defaultLayout: 'main',
      layoutsDir: join(__dirname, '..', 'views', 'layouts'),
      partialsDir: join(__dirname, '..', 'views', 'partials'),
    }),
  );
  app.setViewEngine('hbs');

  // container for validators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Bhumio Assignment')
    .setDescription('The Bhumio Assignment API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-documentation', app, documentFactory);

  // Global Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        throw new UnprocessableEntityException(errors);
      },
    }),
  );

  // Global Interceptors
  app.useGlobalInterceptors(
    new PreviousUrlInterceptor(),
    new SessionErrorInterceptor(),
  );
  // Global Filters
  app.useGlobalFilters(new ValidationErrorFilter());

  // Session and Flash
  const sessionConfig = app.get(ConfigService).get<SessionConfig>('session');
  const fileStore = new (FileStore(session))({
    path: join(__dirname, '..', 'storage', 'sessions'),
  });

  app.use(
    session({
      secret: sessionConfig.secret,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, maxAge: sessionConfig.cookieMaxAge },
      store: fileStore,
    }),
  );
  app.use(flash());

  // Server
  const port = app.get(ConfigService).get<number>('app.port') ?? 3000;
  await app.listen(port);
}
void bootstrap();
