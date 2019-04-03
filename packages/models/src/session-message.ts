import { SessionState, ISessionMgmt } from './messages';

/** Convert a ISessionMessage, as used in the Trial Manager, to a Test-bed ITestbedSessionMessage */
export const sessionMessageToTestbed = (sm: ISessionMgmt, trialName: string, scenarioName: string): ISessionMgmt => ({
  ...sm,
  trialName,
  scenarioName,
  sessionState: sm.sessionState === SessionState.START ? SessionState.START : SessionState.STOP,
});
