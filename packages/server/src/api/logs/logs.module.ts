import { Module } from '@nestjs/common';
import { LogEventsGateway } from '.';
import { KafkaModule } from '../../adapters/kafka';

@Module({
  imports: [KafkaModule],
  providers: [LogEventsGateway],
})
export class LogsEventsModule {}
