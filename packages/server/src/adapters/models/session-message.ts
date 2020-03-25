import { ApiProperty } from '@nestjs/swagger';
import { ISessionManagement, SessionState } from '../../../../models';

export class SessionMessage implements ISessionManagement {
  @ApiProperty()
  public trialId: string;
  @ApiProperty()
  public trialName: string;
  @ApiProperty()
  public scenarioId: string;
  @ApiProperty()
  public scenarioName: string;
  @ApiProperty()
  public id: string;
  @ApiProperty()
  public sessionName: string;
  @ApiProperty()
  public state: SessionState;

  constructor(session: ISessionManagement) {
    if (session.tags) {
      this.trialId = session.tags.trialId;
      this.trialName = session.tags.trialName;
      this.scenarioId = session.tags.scenarioId;
      this.scenarioName = session.tags.scenarioName;
    }
    this.id = session.id;
    this.sessionName = session.name;
    this.state = session.state;
  }
}
