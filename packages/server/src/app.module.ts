import configuration from './config/kafka.js';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { KafkaModule } from './adapters/kafka/index.js';
import {
  ExecutionModule,
  TrialModule,
  RepoModule,
  TimeEventsModule,
  RunModule,
} from './api/index.js';
import { join } from 'path';
import { cwd } from 'process';

// console.log('DIR: ' + __dirname);

@Module({
  imports: [
    ServeStaticModule.forRoot({
      serveRoot: "/tmt/layers",
      rootPath: join(cwd(), 'layers'),
    }),
    ServeStaticModule.forRoot({
      serveRoot: "/tmt/topics",
      rootPath: join(cwd(), 'topics'),
    }),
    ServeStaticModule.forRoot({
      serveRoot: "/",
      rootPath: join(cwd(), 'public'),
    }),
    ConfigModule.forRoot({
      /// load: [ path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}') ] }),
      load: [configuration],
    }),
    KafkaModule,
    TrialModule,
    RepoModule,
    TimeEventsModule,
    ExecutionModule,
    RunModule,
  ],
})
export class AppModule { }
