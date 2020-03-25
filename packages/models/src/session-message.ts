import { SessionState, ISessionManagement } from 'test-bed-schemas';

/** Convert a ISessionMessage, as used in the Trial Manager, to a Test-bed ITestbedSessionMessage */
export const sessionMessageToTestbed = (
  sm: ISessionManagement,
  trialId: string,
  trialName: string,
  scenarioId: string,
  scenarioName: string
): ISessionManagement => ({
  id: sm.id,
  state: sm.state === SessionState.Started ? SessionState.Started : SessionState.Stopped,
  name: sm.name,
  timestamp: Date.now(),
  simulationTime: sm.simulationTime,
  tags: {
    scenarioId,
    scenarioName,
    trialName,
    trialId,
  },
});
