import { Injectable, Inject } from '@nestjs/common';
import { ITrial, IScenario, ISessionMessage, getParent } from 'trial-manager-models';
import { KafkaService } from '../../adapters/kafka';
import { TrialService } from '../trials/trial.service';

@Injectable()
export class RunService {
  private session: ISessionMessage;
  private trial: ITrial;
  private scenario: IScenario;

  constructor(
    @Inject('TrialService') private readonly trialService: TrialService,
    @Inject('KafkaService') private readonly kafkaService: KafkaService,
  ) {}

  public get activeSession() { return this.session ? this.session : undefined; }

  /** Initialize the new trial and scenario */
  public async init(session: ISessionMessage) {
    const { trialId, scenarioId, sessionId, sessionName } = session;
    const trial = await this.trialService.findOne(trialId);
    if (!trial) { return false; }
    const scenario = getParent(trial.injects, scenarioId) as IScenario;
    if (!scenario) { return false; }
    this.session = session;
    this.trial = trial;
    this.scenario = scenario;
    return true;
  }

  /** Close the active scenario */
  public async close() {
    this.session = undefined;
    this.trial = undefined;
    this.scenario = undefined;
  }
}
