import { ITimeMessage, ISessionMessage } from 'trial-manager-models';

/** Application state */
export const AppState = {
  time: {} as ITimeMessage,
  session: {
    id: 1,
    name: '',
    trialId: '',
    scenarioId: '',
    comments: '',
  } as ISessionMessage,
};
