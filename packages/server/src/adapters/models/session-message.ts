import { ApiProperty } from '@nestjs/swagger';
import { ISessionMgmt, SessionState } from 'trial-manager-models';

export class SessionMessage implements ISessionMgmt {
  @ApiProperty()
  public trialId: string;
  @ApiProperty()
  public trialName: string;
  @ApiProperty()
  public scenarioId: string;
  @ApiProperty()
  public scenarioName: string;
  @ApiProperty()
  public sessionId: string;
  @ApiProperty()
  public sessionName: string;
  @ApiProperty()
  public sessionState: SessionState;

  constructor(session: ISessionMgmt) {
    this.trialId = session.trialId;
    this.trialName = session.trialName;
    this.scenarioId = session.scenarioId;
    this.scenarioName = session.scenarioName;
    this.sessionId = session.sessionId;
    this.sessionName = session.sessionName;
    this.sessionState = session.sessionState;
  }
}
