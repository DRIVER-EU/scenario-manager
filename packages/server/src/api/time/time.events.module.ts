import { Module } from '@nestjs/common';
import { TimeEventsGateway } from './index.js';
import { KafkaModule } from '../../adapters/kafka/index.js';

@Module({
  imports: [KafkaModule],
  providers: [TimeEventsGateway],
})
export class TimeEventsModule {}
