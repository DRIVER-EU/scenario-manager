import compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { urlencoded, json } from 'express';
import { SocketAdapter } from './adapters/index.js';
import { readFile, readdir, writeFile } from 'fs/promises';
import { extname, join, resolve } from 'path';
import { cwd } from 'process';

async function createJsonIndex(folderPath: string): Promise<void> {
  // Read the list of files in the specified folder.
  const files = await readdir(folderPath);

  // Filter for JSON files (files with a .json extension).
  const jsonFiles = files.filter((file) => extname(file) === '.json').filter(f => f !== 'index.json');

  // Write the files to index.json in the same folder.
  const indexJsonPath = join(folderPath, 'index.json');
  await writeFile(indexJsonPath, JSON.stringify({ files: jsonFiles }, null, 2));
  console.log('Successfully created index.json');
}

async function bootstrap() {
  const topicsPath = resolve(cwd(), 'topics');
  await createJsonIndex(topicsPath);

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
  // app.use('/', expressStatic(join(cwd(), 'public')));
  // app.use('/tmt/layers', expressStatic(join(cwd(), 'layers')));
  // app.use('/tmt/topics',
  //   expressStatic(join(cwd(), 'topics'), {
  //     setHeaders: (res) => {
  //       res.setHeader('Access-Control-Allow-Origin', '*');
  //     },
  //   }),
  // );

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
