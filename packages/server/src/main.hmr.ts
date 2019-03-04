import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  process.on('uncaughtException', err => {
    console.error('Caught exception: ' + err.message);
    console.error('Stack trace: ' + err.stack);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason.stack || reason);
  });

  const app = await NestFactory.create(AppModule, { cors: true });

  const options = new DocumentBuilder()
    .setTitle('Trial manager service')
    .setDescription('The Trial manager API description')
    .setVersion('0.1')
    .addTag('Trial manager service')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  const port = process.env.TRIAL_MANAGER_SERVER_PORT || 3000;
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
