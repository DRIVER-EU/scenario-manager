import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  process.on('uncaughtException', err => {
    console.error('Caught exception: ' + err);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    if ((reason as any).stack) {
      console.error((reason as any).stack);
    }
  });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb' }));
  app.use(express.static(path.join(process.cwd(), 'public')));

  const options = new DocumentBuilder()
    .setTitle('Trial manager service')
    .setDescription('The Trial manager API description')
    .setVersion('0.1')
    .addTag('Trial manager service')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
  });

  const port = process.env.TRIAL_MANAGER_SERVER_PORT || 3000;
  await app.listen(port, () => {
    console.log(`TRIAL_MANAGER_SERVER_PORT is listening on port ${port}.`);
    console.log(
      `Swagger documentation is available at 'http://localhost:${port}/api'.`,
    );
  });
}
bootstrap();
