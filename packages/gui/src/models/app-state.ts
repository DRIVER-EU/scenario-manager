import { ITimeMessage, ISessionMgmt, IInjectSimStates } from 'trial-manager-models';

/** Application state */
export const AppState = {
  owner: 'TB_TrialMgmt',
  apiService: 'http://localhost:3000',
  time: {} as ITimeMessage,
  sessionControl: {
    isConnected: false,
    realtime: false,
    host: '',
  },
  session: {
    id: 1,
    name: '',
    trialId: '',
    scenarioId: '',
    comments: '',
  } as Partial<ISessionMgmt>,
  simulationView: {
    scenarioId: '',
  },
  injectStates: {} as IInjectSimStates,
};
