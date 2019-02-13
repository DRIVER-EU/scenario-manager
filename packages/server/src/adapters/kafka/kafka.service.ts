import { ConfigService } from 'nestjs-config';
import {
  TestBedAdapter,
  Logger,
  IAdapterMessage,
  ProduceRequest,
  ITestBedOptions,
} from 'node-test-bed-adapter';
import { ITimingControlMessage, ITimeMessage } from '../models';
import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

export interface TimeService {
  on(event: 'time', listener: (time: ITimeMessage) => void): this;
}

@Injectable()
export class KafkaService extends EventEmitter implements TimeService {
  private adapter: TestBedAdapter;
  private log = Logger.instance;

  /**
   * The fictive date and time of the simulation / trial as the number of milliseconds
   * from the UNIX epoch, 1 January 1970 00:00:00.000 UTC.
   */
  private _trialTime?: number;
  /** Current speed of the simulation in number of times real-time */
  private trialTimeSpeed: number;

  // private _state: TimeServiceState;

  constructor(config: ConfigService) {
    super();
    const options = config.get('kafka') as ITestBedOptions;
    if (!options.produce) {
      options.produce = [TestBedAdapter.TimeControlTopic];
    } else if (options.produce.indexOf(TestBedAdapter.TimeControlTopic) < 0) {
      options.produce.push(TestBedAdapter.TimeControlTopic);
    }
    console.table(options);
    this.trialTimeSpeed = 0;

    this.adapter = new TestBedAdapter(options);
    this.adapter.on('ready', () => {
      this.subscribe();
      this.log.info('Consumer is connected');
    });
  }

  public connect() {
    return this.adapter.connect();
  }

  public isConnected() {
    return this.adapter.isConnected;
  }

  private subscribe() {
    this.adapter.on('time', message => this.emit('time', message));
    this.adapter.on('message', message => this.handleMessage(message));
    this.adapter.on('error', err =>
      this.log.error(`Consumer received an error: ${err}`),
    );
    this.adapter.on('offsetOutOfRange', err =>
      this.log.error(`Consumer received an offsetOutOfRange error: ${err}`),
    );
  }

  public sendTimeControlMessage(timeCtrlMsg: ITimingControlMessage) {
    return new Promise<boolean>((resolve, reject) => {
      const payload = {
        topic: TestBedAdapter.TimeControlTopic,
        messages: timeCtrlMsg,
        attributes: 1, // Gzip
      } as ProduceRequest;

      this.adapter.send(payload, (err, data) => {
        if (err) {
          this.log.error(err);
          reject(err);
        } else if (data) {
          this.log.info(data);
          resolve(true);
        }
      });
    });
  }

  public get trialTime() { return this.adapter.trialTime; }

  private handleMessage(message: IAdapterMessage) {
    switch (message.topic) {
      default:
        console.warn('Unhandled message: ' + message.value);
        break;
    }
  }
}
