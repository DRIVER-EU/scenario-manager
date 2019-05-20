import { ConfigService } from 'nestjs-config';
import {
  TestBedAdapter,
  Logger,
  IAdapterMessage,
  ProduceRequest,
  ITestBedOptions,
  ITiming,
  TimeControlTopic,
  ITimingControl,
  IPhaseMessage,
  IRequestChangeOfTrialStage,
  ISessionMgmt,
  TrialManagementPhaseMessageTopic,
  TrialManagementRolePlayerTopic,
  TrialManagementSessionMgmtTopic,
} from 'node-test-bed-adapter';
import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import {
  IRequestStartInject,
  IRequestUnitTransport,
  IAffectedArea,
  ISumoConfiguration,
} from 'trial-manager-models';
export { ITimingControl } from 'node-test-bed-adapter';

export interface TimeService {
  on(event: 'time', listener: (time: ITiming) => void): this;
}

export interface KafkaService {
  // on(event: 'ready' | 'reconnect', listener: () => void): this;
  // on(event: 'error' | 'offsetOutOfRange', listener: (error: string) => void): this;
  // on(event: 'message', listener: (message: IAdapterMessage) => void): this;
  once(event: 'time', listener: (message: ITiming) => void): this;
  on(event: 'time', listener: (message: ITiming) => void): this;
}

@Injectable()
export class KafkaService extends EventEmitter implements TimeService {
  private adapter: TestBedAdapter;
  private kafkaHost: string;
  private session?: ISessionMgmt;
  private log = Logger.instance;

  constructor(config: ConfigService) {
    super();
    const options = config.get('kafka') as ITestBedOptions;
    if (!options.produce) {
      options.produce = [TimeControlTopic];
    } else if (options.produce.indexOf(TimeControlTopic) < 0) {
      options.produce.push(TimeControlTopic);
    }
    console.table({
      kafkaHost: options.kafkaHost,
      schemaRegistry: options.schemaRegistry,
      ssl: options.sslOptions ? true : false,
    });
    this.kafkaHost = options.kafkaHost;
    this.adapter = new TestBedAdapter(options);
    this.adapter.on('ready', () => {
      this.subscribe();
      this.log.info(
        `Consumer is connected to broker running at ${options.kafkaHost}.`,
      );
      // See if we are running a session that was not initialized by this trial.
      this.adapter.addConsumerTopics(
        {
          topic: TrialManagementSessionMgmtTopic,
          offset: 0,
        },
        true,
      );
    });
  }

  public connect() {
    console.log('Connecting...');
    return this.adapter.connect();
  }

  public disconnect() {
    // TODO Add disconnect to adapter
    // return this.adapter.disconnect();
  }

  public isConnected() {
    return this.adapter.isConnected;
  }

  public get currentSession() {
    return this.session;
  }

  public get hostname() {
    return this.kafkaHost;
  }

  private subscribe() {
    this.adapter.on('time', message => {
      this.emit('time', message);
    });
    this.adapter.on('message', message => this.handleMessage(message));
    this.adapter.on('error', err =>
      this.log.error(`Consumer received an error: ${err}`),
    );
    // this.adapter.on('offsetOutOfRange', err =>
    //   this.log.error(`Consumer received an offsetOutOfRange error: ${err.topic}`),
    // );
  }

  public sendTimeControlMessage(timeCtrlMsg: ITimingControl) {
    return this.sendMessage(timeCtrlMsg, TimeControlTopic);
  }

  public sendSessionMessage(sm: ISessionMgmt) {
    return this.sendMessage(sm, TrialManagementSessionMgmtTopic);
  }

  public sendPhaseMessage(pm: IPhaseMessage) {
    return this.sendMessage(pm, TrialManagementPhaseMessageTopic);
  }

  public sendOstStageChangeRequestMessage(om: IRequestChangeOfTrialStage) {
    return this.sendMessage(om, 'system_request_change_of_trial_stage');
  }

  public sendRolePlayerMessage<ITestbedRolePlayerMessage>(
    rpm: ITestbedRolePlayerMessage,
  ) {
    return this.sendMessage(rpm, TrialManagementRolePlayerTopic);
  }

  public sendStartInjectMessage(m: IRequestStartInject) {
    return this.sendMessage(m, 'simulation_request_startinject');
  }

  public sendRequestUnitTransport(m: IRequestUnitTransport) {
    return this.sendMessage(m, 'simulation_request_unittransport');
  }

  public sendSetAffectedArea(m: IAffectedArea) {
    return this.sendMessage(m, 'sumo_AffectedArea');
  }

  public sendSumoConfiguration(m: ISumoConfiguration) {
    return this.sendMessage(m, 'sumo_SumoConfiguration');
  }

  public get timeMessage() {
    return {
      updatedAt: Date.now(),
      trialTime: this.trialTime.valueOf(),
      timeElapsed: this.adapter.timeElapsed.valueOf(),
      trialTimeSpeed: this.adapter.trialTimeSpeed,
      state: this.adapter.state,
    } as ITiming;
  }

  public get trialTime() {
    return this.adapter.trialTime;
  }

  public sendMessage<T>(m: T, topic: string) {
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
      case TrialManagementSessionMgmtTopic:
        this.session = message.value as ISessionMgmt;
        break;
      default:
        console.warn('Unhandled message: ' + message.value);
        break;
    }
  }
}
