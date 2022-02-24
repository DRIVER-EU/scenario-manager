import * as path from 'path';
import * as express from 'express';
import { json, urlencoded } from 'body-parser';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  process.on('uncaughtException', (err) => {
    console.error('Caught exception: ' + err.message);
    console.error('Stack trace: ' + err.stack);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    if ((reason as any).stack) {
      console.error((reason as any).stack);
    }
  });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb' }));
  app.use('/tmt', express.static(path.join(process.cwd(), 'public')));

  app.setGlobalPrefix('tmt')

  const options = new DocumentBuilder()
    .setTitle('Trial manager service')
    .setDescription('The Trial manager API description')
    .setVersion('0.1')
    .addTag('Trial manager service')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/tmt/api', app, document);

  const port = process.env.TRIAL_MANAGER_SERVER_PORT || 3210;
  await app.listen(port, () => {
    console.log(
      `TRIAL_MANAGER_SERVER_PORT is listening on port ${port}. Swagger documentation is available at 'http://localhost:${port}/api'.`,
    );
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
