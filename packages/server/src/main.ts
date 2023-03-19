import * as path from 'path';
import compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { urlencoded, json, static as expressStatic } from 'express';
import { SocketAdapter } from './adapters/index.js';

async function bootstrap() {
  console.log(`Working directory: ${process.cwd()}`);
  process.on('uncaughtException', (err) => {
    console.error('Caught exception: ' + err);
    console.error('Stack trace: ' + err.stack);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    if ((reason as any).stack) {
      console.error((reason as any).stack);
    }
  });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    cors: true,
  });
  app.useWebSocketAdapter(new SocketAdapter(app));
  app.use(compression());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  app.use('/tmt', expressStatic(path.join(process.cwd(), 'public')));
  app.use(
    '/tmt/topics',
    expressStatic(path.join(process.cwd(), 'topics'), {
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
      },
    }),
  );

  app.setGlobalPrefix('tmt');

  const options = new DocumentBuilder()
    .setTitle('Trial manager service')
    .setDescription('The Trial manager API description')
    .setVersion('1.0')
    .addTag('Trial manager service')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/tmt/api', app, document);

  const port = process.env.TRIAL_MANAGER_SERVER_PORT || 3210;
  await app.listen(port, () => {
    console.log(`TRIAL_MANAGER_SERVER_PORT is listening on port ${port}.`);
    console.log(
      `Swagger documentation is available at 'http://localhost:${port}/api'.`,
    );
  });
}
bootstrap();
