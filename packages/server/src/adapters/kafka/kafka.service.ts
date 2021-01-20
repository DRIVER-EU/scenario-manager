import { ConfigService } from '@nestjs/config';
import {
  TestBedAdapter,
  Logger,
  IAdapterMessage,
  ProduceRequest,
  ITestBedOptions,
  ITimeManagement,
  ITimeControl,
  IPhaseMessage,
  ISessionManagement,
  IRequestChangeOfTrialStage,
  TimeControlTopic,
  LargeDataUpdateTopic,
  RequestChangeOfTrialStage,
  TrialManagementPhaseMessageTopic,
  TrialManagementRolePlayerTopic,
  TrialManagementSessionMgmtTopic,
  IRequestStartInject,
  IRequestMove,
  IAffectedArea,
  ISumoConfiguration,
  ILargeDataUpdate,
} from 'node-test-bed-adapter';
import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { debounce } from '../../../../models';
export { ITimeControl } from 'node-test-bed-adapter';

export interface TimeService {
  on(event: 'time', listener: (time: ITimeManagement) => void): this;
}

export interface KafkaService {
  // on(event: 'ready' | 'reconnect', listener: () => void): this;
  // on(event: 'error' | 'offsetOutOfRange', listener: (error: string) => void): this;
  // on(event: 'message', listener: (message: IAdapterMessage) => void): this;
  once(event: 'time', listener: (message: ITimeManagement) => void): this;
  on(event: 'time', listener: (message: ITimeManagement) => void): this;
  on(
    event: 'session-update',
    listener: (message: ISessionManagement) => void,
  ): this;
}

@Injectable()
export class KafkaService extends EventEmitter implements TimeService {
  private adapter?: TestBedAdapter;
  private options: ITestBedOptions;
  private kafkaHost: string;
  private session?: ISessionManagement;
  private debouncedEmit: (event: string | symbol, ...args: any[]) => void;
  private log = Logger.instance;

  constructor(config: ConfigService) {
    super();
    this.options = config.get('kafka') as ITestBedOptions;
    if (!this.options.produce) {
      this.options.produce = [TimeControlTopic];
    } else if (this.options.produce.indexOf(TimeControlTopic) < 0) {
      this.options.produce.push(TimeControlTopic);
    }
    console.table({
      kafkaHost: this.options.kafkaHost,
      schemaRegistry: this.options.schemaRegistry,
      ssl: this.options.sslOptions ? true : false,
    });
    console.log(`Produce topics: ${this.options.produce.join(', ')}`);
    this.kafkaHost = this.options.kafkaHost;
    this.debouncedEmit = debounce(this.emit, 1000);
  }

  public connect() {
    console.log('Connecting...');
    this.adapter = new TestBedAdapter(this.options);
    this.adapter.on('ready', () => {
      this.subscribe();
      this.log.info(
        `Consumer is connected to broker running at ${this.options.kafkaHost}.`,
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
    return this.adapter.connect();
  }

  public disconnect() {
    return this.adapter && this.adapter.disconnect();
  }

  public isConnected() {
    return this.adapter && this.adapter.isConnected;
  }

  public get currentSession() {
    return this.session;
  }

  public get hostname() {
    return this.kafkaHost;
  }

  private subscribe() {
    this.adapter.on('time', (message) => {
      this.emit('time', message);
    });
    this.adapter.on('message', (message) => this.handleMessage(message));
    this.adapter.on('error', (err) =>
      this.log.error(`Consumer received an error: ${err}`),
    );
    // this.adapter.on('offsetOutOfRange', err =>
    //   this.log.error(`Consumer received an offsetOutOfRange error: ${err.topic}`),
    // );
  }

  public sendTimeControlMessage(timeCtrlMsg: ITimeControl) {
    return this.sendMessage(timeCtrlMsg, TimeControlTopic);
  }

  public sendSessionMessage(sm: ISessionManagement) {
    return this.sendMessage(sm, TrialManagementSessionMgmtTopic);
  }

  public sendPhaseMessage(pm: IPhaseMessage) {
    return this.sendMessage(pm, TrialManagementPhaseMessageTopic);
  }

  public sendOstStageChangeRequestMessage(om: IRequestChangeOfTrialStage) {
    return this.sendMessage(om, RequestChangeOfTrialStage);
  }

  public sendRolePlayerMessage<ITestbedRolePlayerMessage>(
    rpm: ITestbedRolePlayerMessage,
  ) {
    return this.sendMessage(rpm, TrialManagementRolePlayerTopic);
  }

  public sendStartInjectMessage(m: IRequestStartInject) {
    return this.sendMessage(m, 'simulation_request_startinject');
  }

  public sendLargeDataUpdateMessage(m: ILargeDataUpdate) {
    return this.sendMessage(m, LargeDataUpdateTopic);
  }

  public sendRequestUnitTransport(m: IRequestMove) {
    return this.sendMessage(m, 'simulation_request_move');
  }

  public sendSetAffectedArea(m: IAffectedArea) {
    return this.sendMessage(m, 'simulation_affected_area');
  }

  public sendSumoConfiguration(m: ISumoConfiguration) {
    return this.sendMessage(m, 'simulation_sumo_configuration');
  }

  public get timeMessage() {
    // this.adapter && console.log(this.adapter.timeElapsed);
    return this.adapter && this.adapter.simulationTime
      ? ({
          timestamp: Date.now(),
          simulationTime: this.adapter.simulationTime.valueOf(),
          simulationSpeed: this.adapter.simulationSpeed,
          state: this.adapter.timeState,
          tags: { timeElapsed: this.adapter.timeElapsed.valueOf().toString() },
        } as ITimeManagement)
      : undefined;
  }

  public get simulationTime() {
    return this.adapter.simulationTime;
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
          this.log.error(`TMT error for payload topic ${topic}: ${err}`);
          reject(err);
        } else if (data) {
          this.log.info(data);
          resolve(true);
        }
      });
    });
  }

  // private debouncer: NodeJS.Timeout;

  private handleMessage(message: IAdapterMessage) {
    switch (message.topic) {
      case TrialManagementSessionMgmtTopic:
        this.session = message.value as ISessionManagement;
        // clearTimeout(this.debouncer);
        // this.debouncer = setTimeout(() => console.table(this.session), 1000);
        // debounce(() => console.table(this.session), 1000);
        this.debouncedEmit('session-update', this.session);
        break;
      default:
        console.warn('Unhandled message: ' + message.value);
        break;
    }
  }
}
