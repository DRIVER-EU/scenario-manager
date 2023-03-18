import configuration from './config/kafka.js';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './adapters/kafka/index.js';
import {
  ExecutionModule,
  TrialModule,
  RepoModule,
  TimeEventsModule,
  RunModule,
} from './api/index.js';

// console.log('DIR: ' + __dirname);

@Module({
  imports: [
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
export class AppModule {}
