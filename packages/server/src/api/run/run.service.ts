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
  IStateUpdate,
  InjectState,
  InjectConditionType,
  toMsec,
  InjectType,
  MessageType,
  SessionState,
  IStateTransitionRequest,
  getChildren,
} from 'trial-manager-models';
import { KafkaService } from '../../adapters/kafka';
import { TrialService } from '../trials/trial.service';
import { ExecutionService } from './execution.service';
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
  private states: { [id: string]: IStateUpdate } = {};
  private isRunning = false;
  private trialTime: Date;

  constructor(
    @Inject('TrialService') private readonly trialService: TrialService,
    @Inject('KafkaService') private readonly kafkaService: KafkaService,
    @Inject('ExecutionService')
    private readonly executionService: ExecutionService,
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

    this.injects = this.pruneInjects();

    const startUpdateLoop = () => {
      this.trialTime = this.kafkaService.trialTime;
      this.states = this.injects.reduce((acc, i) => {
        acc[i.id] = {
          state: i.condition ? InjectState.ON_HOLD : InjectState.IN_PROGRESS,
          lastTransitionAt: this.trialTime,
          title: `${i.type}: ${i.title}`,
        } as IStateUpdate;
        return acc;
      }, {});
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

  /** Prune all injects and only keep those that are part of the selected scenario */
  private pruneInjects() {
    if (!this.trial.injects) {
      return undefined;
    }
    const getChildren = (id: string) =>
      this.trial.injects.filter(i => i.parentId === id);
    const scenarioId = this.scenario.id;
    const storylines = getChildren(scenarioId) as IInjectGroup[];
    const acts = storylines.reduce(
      (acc, s) => [...acc, ...getChildren(s.id)],
      [] as IInjectGroup[],
    );
    const injects = acts.reduce(
      (acc, a) => [...acc, ...getChildren(a.id)],
      [] as IInject[],
    );
    return [this.scenario, ...storylines, ...acts, ...injects];
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
    let done = true;
    const trialTime = this.trialTime;
    const trialTimeValue = trialTime.valueOf();
    const transitionNow = (id: string, to: InjectState) => {
      done = false;
      const state = this.states[id];
      state.lastTransitionAt = trialTime;
      state.state = to;
    };
    const groupInjects = (i: IInject) => i.type !== InjectType.INJECT;
    const inProgressInjects = (i: IInject) => this.states[i.id].state === InjectState.IN_PROGRESS;
    const childInjectsExecuted = (i: IInject) => getChildren(this.injects, i.id)
      .reduce((acc, cur) => acc && this.states[cur.id].state === InjectState.EXECUTED, true);
    const onHoldInjects = (i: IInject) => this.states[i.id].state === InjectState.ON_HOLD;
    const parentInProgress = (i: IInject) => this.states[i.parentId].state === InjectState.IN_PROGRESS;
    const scheduledInjects = (i: IInject) => this.states[i.id].state === InjectState.SCHEDULED;
    const conditionFilter = (i: IInject) => {
      if (!i.condition) {
        return true;
      }
      const { type, delay, delayUnitType, injectId, injectState } = i.condition;
      if (type === InjectConditionType.AT_TIME) {
        const time =
          this.scenario.startDate.valueOf() + toMsec(delay, delayUnitType);
        return trialTimeValue >= time;
      }
      const { state, lastTransitionAt } = this.states[injectId];
      if (state !== injectState) {
        return false;
      }
      if (type === InjectConditionType.IMMEDIATELY) {
        return true;
      }
      if (type === InjectConditionType.DELAY) {
        const time = lastTransitionAt.valueOf() + toMsec(delay, delayUnitType);
        return trialTimeValue >= time;
      }
    };

    do {
      done = true;

      // Injects that are ON_HOLD and whose parent is IN_PROGRESS, transition them to SCHEDULED.
      this.injects
        .filter(onHoldInjects)
        .filter(parentInProgress)
        .forEach(i => transitionNow(i.id, InjectState.SCHEDULED));

      // Injects that are SCHEDULED and pass all conditions, transition them to IN_PROGRESS
      this.injects
        .filter(scheduledInjects)
        .filter(conditionFilter)
        .forEach(i => transitionNow(i.id, InjectState.IN_PROGRESS));

      // Injects that are a group (scenario, storyline and act), that are still in progress,
      // and whose children are all executed, transition them too to EXECUTED.
      this.injects
        .filter(groupInjects)
        .filter(inProgressInjects)
        .filter(childInjectsExecuted)
        .forEach(i => transitionNow(i.id, InjectState.EXECUTED));

    } while (!done);
  }

  /** Execute each inject that is IN_PROGRESS */
  private executeInjects() {
    const actionableInjects = (i: IInject) =>
      i.type === InjectType.INJECT &&
      this.states[i.id].state === InjectState.IN_PROGRESS;
    this.injects.filter(actionableInjects).forEach(i => {
      // TODO Add actual implementation based.
      this.executionService.execute(i);
      this.transitionTo(i, InjectState.EXECUTED);
      console.log(`Executing ${i.title}...`);
    });
  }

  private transitionTo(i: IInject, is: InjectState) {
    this.stateTransitionRequest(
      new StateTransitionRequest(i.id, this.states[i.id].state, is),
    );
  }

  /** Send a state update message to all connected clients */
  private sendStateUpdate() {
    console.table(this.states);
    this.server.emit('injectStates', this.states);
  }
}
