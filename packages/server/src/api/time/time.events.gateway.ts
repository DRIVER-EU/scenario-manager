import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Server } from 'socket.io';
import { KafkaService, ITimingControl } from '../../adapters/kafka';
import { IConnectMessage } from 'trial-manager-models';

@WebSocketGateway()
export class TimeEventsGateway {
  @WebSocketServer() server: Server;

  constructor(
    @Inject('KafkaService') private readonly kafkaService: KafkaService,
  ) {
    kafkaService.on('time', time => {
      this.server.emit('time', time);
    });
  }

  @SubscribeMessage('test-bed-disconnect')
  async disconnect() {
    // console.log('disconnect received');
    if (!this.kafkaService.isConnected()) {
      return this.isConnected();
    }
    await this.kafkaService.disconnect();
    return this.isConnected();
  }

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
    return {
      event: 'is-connected',
      data: {
        isConnected: this.kafkaService.isConnected(),
        time: this.kafkaService.timeMessage,
        session: this.kafkaService.currentSession,
        host: this.kafkaService.hostname,
      } as IConnectMessage,
    };
  }

  @SubscribeMessage('time-control')
  async timeControl(_client, data: ITimingControl) {
    // console.log('time-control');
    // console.table(data);
    return this.kafkaService.sendTimeControlMessage(data);
  }
}
