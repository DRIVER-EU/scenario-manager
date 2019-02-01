import { Module } from '@nestjs/common';
import { TimeEventsGateway } from '.';
import { KafkaModule } from '../../adapters/kafka';

@Module({
  imports: [KafkaModule],
  providers: [TimeEventsGateway],
})
export class TimeEventsModule {}
