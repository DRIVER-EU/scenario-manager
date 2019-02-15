import { ApiModelProperty } from '@nestjs/swagger';
import { ISessionMessage, TimeState } from 'trial-manager-models';

export class SessionMessage implements ISessionMessage {
  @ApiModelProperty()
  public trialId: string;
  @ApiModelProperty()
  public scenarioId: string;
  @ApiModelProperty()
  public id: number;
  @ApiModelProperty()
  public name: string;
  public status?: TimeState;

  constructor(session: ISessionMessage) {
    this.trialId = session.trialId;
    this.scenarioId = session.scenarioId;
    this.id = session.id;
    this.name = session.name;
    this.status = session.status;
  }
}
