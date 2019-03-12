import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Inject } from '@nestjs/common';
import {
  ITrial,
  IScenario,
  ITestbedSessionMessage,
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
} from 'trial-manager-models';
import { KafkaService } from '../../adapters/kafka';
import { TrialService } from '../trials/trial.service';
import { StateTransitionRequest } from '../../adapters/models';

@Injectable()
@WebSocketGateway()
export class RunService {
  @WebSocketServer() private server: Server;
  private session: ITestbedSessionMessage;
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
    return this.session ? this.session : undefined;
  }

  /** Initialize the new trial and scenario */
  public async init(session: ITestbedSessionMessage) {
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

    const startUpdateLoop = () => {
      this.trialTime = this.kafkaService.trialTime;
      this.states = createInitialState(this.trialTime, this.injects);
      this.kafkaService.sendSessionMessage(this.session);
      this.isRunning = true;
      this.updateLoop();
    };

    if (this.kafkaService.once('time', time => {
      if (time.state === 'Initialized' || time.state === 'Started') {
        startUpdateLoop();
      }
    }))
    return true;
  }

  /** Close the active scenario */
  public async close() {
    this.session.sessionState = SessionState.STOP;
    this.kafkaService.sendSessionMessage(this.session);
    this.isRunning = false;
    this.session = undefined;
    this.trial = undefined;
    this.scenario = undefined;
    this.injects = [];
    this.states = {};
  }

  /** Add a request for a state transition */
  public stateTransitionRequest(tr: StateTransitionRequest) {
    // TODO Check if the state transition is valid, e.g. not from ON_HOLD to EXECUTED.
    if (this.states.hasOwnProperty(tr.id)) {
      this.transitionQueue.push(tr);
    }
    return true;
  }

  /** Process all injects and update the states */
  private updateLoop() {
    if (this.isRunning) {
      setTimeout(() => this.updateLoop(), 1000);
    }
    const time = this.kafkaService.trialTime;
    if (time.valueOf() === this.trialTime.valueOf()) {
      return;
    }
    this.trialTime = time;
    this.transitionInjects();
    this.processTransitionQueue();
    this.executeInjects();
    this.sendStateUpdate();
  }

  /** Process all manual requests to transition a state. */
  private processTransitionQueue() {
    const t = this.trialTime;
    while (this.transitionQueue.length > 0) {
      const tr = this.transitionQueue.shift();
      this.transition(tr, t);
    }
  }

  /** Perform a transition */
  private transition(tr: StateTransitionRequest, t: Date) {
    const state = this.states[tr.id];
    if (state && state.state === tr.from) {
      state.lastTransitionAt = t;
      state.state = tr.to;
    }
  }

  /** Transition all injects when the conditions are satisfied, until no more state is changed. */
  private transitionInjects() {
    transitionInjects(this.trialTime, this.states, this.injects, this.scenario.startDate);
  }

  /** Execute each inject that is IN_PROGRESS */
  private executeInjects() {
    executeInjects(this.trialTime, this.states, this.injects, this.executionService);
  }

  /** Send a state update message to all connected clients */
  private sendStateUpdate() {
    // console.table(this.states);
    this.server.emit('injectStates', this.states);
  }
}
