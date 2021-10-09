import configuration from './config/kafka';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './adapters/kafka';
import {
  ExecutionModule,
  TrialModule,
  RepoModule,
  TimeEventsModule,
  RunModule,
} from './api';

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
