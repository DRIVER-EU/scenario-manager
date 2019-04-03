import { ITimeMessage, ISessionMgmt } from 'trial-manager-models';

/** Application state */
export const AppState = {
  apiService: 'http://localhost:3000',
  time: {} as ITimeMessage,
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
};
