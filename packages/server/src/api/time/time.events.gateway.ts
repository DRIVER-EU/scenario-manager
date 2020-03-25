import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Server } from 'socket.io';
import { KafkaService, ITimeControl } from '../../adapters/kafka';
import { IConnectMessage } from '../../../../models';

@WebSocketGateway()
export class TimeEventsGateway {
  @WebSocketServer() server: Server;

  constructor(
    @Inject('KafkaService') private readonly kafkaService: KafkaService,
  ) {
    kafkaService.on('time', time => this.server.emit('time', time));
    kafkaService.on('session-update', _ => this.sendConnectionStatus());
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

  async sendConnectionStatus() {
    const ic = await this.isConnected();
    this.server.emit(ic.event, ic.data);
  }

  @SubscribeMessage('test-bed-connect')
  async connect() {
    // console.log('connect received');
    if (this.kafkaService.isConnected()) {
      this.sendConnectionStatus();
      return this.isConnected();
    }
    await this.kafkaService.connect();
    this.sendConnectionStatus();
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
  async timeControl(_client, data: ITimeControl) {
    // console.log('time-control');
    // console.table(data);
    return this.kafkaService.sendTimeControlMessage(data);
  }
}
