import { ApiModelProperty } from '@nestjs/swagger';
import { ISessionMessage, ExecutionStatus } from 'trial-manager-models';

export class SessionMessage implements ISessionMessage {
  @ApiModelProperty()
  public trialId: string;
  @ApiModelProperty()
  public scenarioId: string;
  @ApiModelProperty()
  public sessionId: number;
  @ApiModelProperty()
  public sessionName: string;
  @ApiModelProperty()
  public status?: ExecutionStatus | undefined;

  constructor(session: ISessionMessage) {
    this.trialId = session.trialId;
    this.scenarioId = session.scenarioId;
    this.sessionId = session.sessionId;
    this.sessionName = session.sessionName;
  }
}
