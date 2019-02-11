import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Server } from 'socket.io';
import { KafkaService } from '../../adapters/kafka';
import { ITimingControlMessage } from './../../adapters/models';

@WebSocketGateway()
export class TimeEventsGateway {
  @WebSocketServer() server: Server;

  constructor(@Inject('KafkaService') private readonly kafkaService: KafkaService) {
    kafkaService.on('time', time => {
      this.server.emit('time', time);
    });
  }

  // @SubscribeMessage('time-events')
  // findAll(client, data): Observable<WsResponse<number>> {
  //   return from([1, 2, 3, 4, 5]).pipe(map(item => ({ event: 'time-events', data: item })));
  // }

  @SubscribeMessage('test-bed-connect')
  async connect() {
    // console.log('connect received');
    if (this.kafkaService.isConnected()) {
      return this.isConnected();
    }
    await this.kafkaService.connect();
    return this.isConnected();
  }

  @SubscribeMessage('is-connected')
  async isConnected() {
    return { event: 'is-connected', data: this.kafkaService.isConnected() };
  }

  @SubscribeMessage('time-control')
  timeControl(_client, data: ITimingControlMessage) {
    // console.log('time-control');
    // console.table(data);
    return this.kafkaService.sendTimeControlMessage(data);
  }

}
