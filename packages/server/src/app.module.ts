import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TrialModule } from './api/trials/trial.module';
import { RepoModule } from './api/repo/repo.module';
import { TimeEventsModule } from './api/time';
import { KafkaModule } from './adapters/kafka';
import { RunModule } from './api/run/run.module';
import configuration from './config/kafka';


// console.log('DIR: ' + __dirname);

@Module({
  imports: [
    ConfigModule.forRoot({
      /// load: [ path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}') ] }),
      load: [configuration],
    }),
    RunModule,
    KafkaModule,
    TrialModule,
    RepoModule,
    TimeEventsModule,
  ],
})
export class AppModule { }
