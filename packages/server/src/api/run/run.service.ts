import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Inject } from '@nestjs/common';
import {
  ITrial,
  IScenario,
  ISessionMgmt,
  getParent,
  IInjectGroup,
  IInject,
  SessionState,
  transitionInjects,
  pruneInjects,
  IExecutionService,
  executeInjects,
  createInitialState,
  IInjectSimStates,
  IConnectMessage,
} from 'trial-manager-models';
import { KafkaService } from '../../adapters/kafka';
import { TrialService } from '../trials/trial.service';
import { StateTransitionRequest } from '../../adapters/models';

@Injectable()
@WebSocketGateway()
export class RunService {
  @WebSocketServer() private server: Server;
  private session: ISessionMgmt;
  /** Queue fr new and updated injects */
  private readonly injectsQueue: IInject[] = [];
  private readonly transitionQueue: StateTransitionRequest[] = [];
  private trial: ITrial;
  private scenario: IScenario;
  private injects: Array<IInject | IInjectGroup> = [];
  private states = {} as IInjectSimStates;
  private isRunning = false;
  private trialTime: Date;

  constructor(
    @Inject('TrialService') private readonly trialService: TrialService,
    @Inject('KafkaService') private readonly kafkaService: KafkaService,
    @Inject('ExecutionService')
    private readonly executionService: IExecutionService,
  ) {}

  public get activeSession() {
    return this.session ? this.session : this.kafkaService.currentSession ;
  }

  /** Initialize the new trial and scenario */
  public async init(session: ISessionMgmt) {
    const { trialId, scenarioId, sessionId, sessionName } = session;

    console.log(`Starting trial, session ${sessionId}: ${sessionName}.`);

    const trial = await this.trialService.findOne(trialId);
    if (!trial) {
      return false;
    }
    this.executionService.init(trial);
    const scenario = getParent(trial.injects, scenarioId) as IScenario;
    if (!scenario) {
      return false;
    }
    this.session = session;
    this.trial = trial;
    this.scenario = scenario;

    this.injects = pruneInjects(this.scenario, this.trial.injects);

    this.sendConnectionStatus();
    this.kafkaService.sendSessionMessage(this.session);

    const startUpdateLoop = () => {
      this.trialTime = this.kafkaService.trialTime;
      this.states = createInitialState(this.trialTime, this.injects);
      this.isRunning = true;
      this.updateLoop();
    };

    if (
      this.kafkaService.once('time', time => {
        if (time.state === 'Initialized' || time.state === 'Started') {
          startUpdateLoop();
        }
      })
    )
      return true;
  }

  /** Close the active scenario */
  public async close() {
    this.isRunning = false;
    this.activeSession.sessionState = SessionState.STOP;
    this.kafkaService.sendSessionMessage(this.activeSession);
    // setTimeout(() => {
    this.session = undefined;
    this.trial = undefined;
    this.scenario = undefined;
    this.injects = [];
    this.states = {};
    this.sendConnectionStatus();
    // }, 1000);
  }

  private sendConnectionStatus() {
    const cm = ({
      isConnected: this.kafkaService.isConnected(),
      time: this.kafkaService.timeMessage,
      session: this.kafkaService.currentSession,
      host: this.kafkaService.hostname,
    } as IConnectMessage);
    this.server.emit('is-connected', cm);
  }

  /** Add a request for a state transition */
  public stateTransitionRequest(tr: StateTransitionRequest) {
    // TODO Check if the state transition is valid, e.g. not from ON_HOLD to EXECUTED.
    if (this.states.hasOwnProperty(tr.id)) {
      this.transitionQueue.push(tr);
    }
    return true;
  }

  /** Update or create a new inject */
  public updateOrCreateInject(i: IInject) {
    this.injectsQueue.push(i);
    // console.dir("Inject Found: " + x.title + " with ID: " + x.id);
    console.dir('run.service received inject: ' + i.title);
  }

  /** Process all injects and update the states */
  private updateLoop() {
    const scheduleRestart = () => {
      if (this.isRunning) {
        const at = Date.now();
        setTimeout(() => this.updateLoop(), Math.max(0, 1000 - (at - now)));
      }
    };

    if (!this.isRunning) {
      return;
    }
    const now = Date.now();
    const time = this.kafkaService.trialTime;
    if (time === this.trialTime) {
      scheduleRestart();
    }
    this.trialTime = time;
    this.processInjectsQueue();
    this.transitionInjects();
    this.processTransitionQueue();
    this.executeInjects();
    this.sendStateUpdate();
    scheduleRestart();
  }

  /** Process all manual requests to transition a state. */
  private processTransitionQueue() {
    const t = this.trialTime;
    while (this.transitionQueue.length > 0) {
      const tr = this.transitionQueue.shift();
      console.log(
        `${new Date()}: Processing one transmission request from ${tr.from}.`,
      );
      this.transition(tr, t);
    }
  }

  /** Process all manual requests to transition a state. */
  private processInjectsQueue() {
    while (this.injectsQueue.length > 0) {
      const inject = this.injectsQueue.shift();
      const { id } = inject;
      const found = this.injects.findIndex(u => u.id === id);
      if (found) {
        console.log(`${new Date()}: Updating inject ${inject.title}.`);
        this.injects[found] = inject;
        this.server.emit('updatedInject', inject);
      } else {
        console.log(`${new Date()}: Adding inject ${inject.title}.`);
        this.injects.push(inject);
        this.server.emit('createdInject', inject);
      }
    }
  }

  /**
   * Perform a transition.
   * @param tr transition request
   * @param t trial time
   */
  private transition(tr: StateTransitionRequest, t: Date) {
    const state = this.states[tr.id];
    if (state && state.state === tr.from) {
      if (tr.expectedExecutionTimeAt) {
        state.delayInSeconds = (t.valueOf() - tr.expectedExecutionTimeAt) / 1000;
      }
      state.lastTransitionAt = t;
      state.state = tr.to;
    }
  }

  /** Transition all injects when the conditions are satisfied, until no more state is changed. */
  private transitionInjects() {
    transitionInjects(
      this.trialTime,
      this.states,
      this.injects,
      new Date(this.scenario.startDate),
    );
  }

  /** Execute each inject that is IN_PROGRESS */
  private executeInjects() {
    executeInjects(
      this.trialTime,
      this.states,
      this.injects,
      this.executionService,
    );
  }

  /** Send a state update message to all connected clients */
  private sendStateUpdate() {
    // console.table(this.states);
    this.server.emit('injectStates', this.states);
  }
}
