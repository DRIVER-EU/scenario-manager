import { ConfigService } from 'nestjs-config';
import {
  TestBedAdapter,
  Logger,
  IAdapterMessage,
  ProduceRequest,
  ITestBedOptions,
  ITimeMessage,
} from 'node-test-bed-adapter';
import {
  ITimingControlMessage,
  IPhaseMessage,
  ITestbedSessionMessage,
  IOstStageChangeMessage,
  IRolePlayerMessage,
} from 'trial-manager-models';
import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

export interface TimeService {
  on(event: 'time', listener: (time: ITimeMessage) => void): this;
}

@Injectable()
export class KafkaService extends EventEmitter implements TimeService {
  private adapter: TestBedAdapter;
  private log = Logger.instance;

  constructor(config: ConfigService) {
    super();
    const options = config.get('kafka') as ITestBedOptions;
    if (!options.produce) {
      options.produce = [TestBedAdapter.TimeControlTopic];
    } else if (options.produce.indexOf(TestBedAdapter.TimeControlTopic) < 0) {
      options.produce.push(TestBedAdapter.TimeControlTopic);
    }
    console.table(options);

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

  public sendSessionMessage(sm: ITestbedSessionMessage) {
    return this.sendMessage(sm, 'session_mgmt');
  }

  public sendPhaseMessage(pm: IPhaseMessage) {
    return this.sendMessage(pm, 'phase_message');
  }

  public sendOstStageChangeRequestMessage(om: IOstStageChangeMessage) {
    return this.sendMessage(om, 'system_request_change_of_trial_stage');
  }

  public sendRolePlayerMessage(rpm: IRolePlayerMessage) {
    return this.sendMessage(rpm, 'role_player');
  }

  public get timeMessage() {
    return {
      updatedAt: Date.now(),
      trialTime: this.trialTime.valueOf(),
      timeElapsed: this.adapter.timeElapsed.valueOf(),
      trialTimeSpeed: this.adapter.trialTimeSpeed,
      state: this.adapter.state,
    } as ITimeMessage;
  }

  public get trialTime() {
    return this.adapter.trialTime;
  }

  private sendMessage<T>(m: T, topic: string) {
    return new Promise<boolean>((resolve, reject) => {
      console.table(m);
      const payload = {
        topic,
        messages: m,
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

  private handleMessage(message: IAdapterMessage) {
    switch (message.topic) {
      default:
        console.warn('Unhandled message: ' + message.value);
        break;
    }
  }
}
