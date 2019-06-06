import { ITimeMessage, ISessionMgmt, IInjectSimStates } from 'trial-manager-models';

/** Application state */
export const AppState = {
  owner: 'TB_TrialMgmt',
  apiService: 'http://localhost:3210',
  time: {} as ITimeMessage,
  sessionControl: {
    isConnected: false,
    activeSession: false,
    realtime: false,
    host: '',
  },
  scenarioStartTime: new Date(),
  session: {
    id: 1,
    name: '',
    trialId: '',
    scenarioId: '',
    comments: '',
  } as Partial<ISessionMgmt>,
  scenarioId: '',
  injectStates: {} as IInjectSimStates,
};
