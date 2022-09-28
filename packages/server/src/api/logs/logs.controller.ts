import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ISystemLog } from 'trial-manager-models';
import { KafkaService } from '../../adapters/kafka';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class LogEventsGateway {
  @WebSocketServer() private server: Server;

  private logs = [] as Array<ISystemLog>;

  constructor(private readonly kafkaService: KafkaService) {
    this.kafkaService.on('system-log', (message: ISystemLog) => {
      this.logs.push(message)
      this.server.emit('system-log', this.logs);
    });
  }
}
