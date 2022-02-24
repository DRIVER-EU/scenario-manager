import { ApiProperty } from '@nestjs/swagger';
import { ISessionManagement, SessionState } from 'trial-manager-models';

export class SessionMessage implements ISessionManagement {
  @ApiProperty()
  public id: string;
  @ApiProperty()
  public name: string;
  @ApiProperty()
  public tags: {
    trialId?: string;
    trialName?: string;
    scenarioId?: string;
    scenarioName?: string;
    comment?: string;
  };
  @ApiProperty()
  public state: SessionState;

  constructor(session: ISessionManagement) {
    if (session.tags) {
      this.tags.trialId = session.tags.trialId;
      this.tags.trialName = session.tags.trialName;
      this.tags.scenarioId = session.tags.scenarioId;
      this.tags.scenarioName = session.tags.scenarioName;
    }
    this.id = session.id;
    this.name = session.name;
    this.state = session.state;
  }
}
