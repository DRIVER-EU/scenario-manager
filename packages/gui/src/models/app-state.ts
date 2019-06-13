import { ITimeMessage, ISessionMgmt, IInjectSimStates } from 'trial-manager-models';

const getRootUrl = () => {
  // Regex matching everything until the first hash symbol, so should also be able to deal with route rewriting...
  const regex = /https?:\/\/.*(?=\/#)/i;
  const route = document.location.href;
  const m = route.match(regex);
  const root = (m && m.length === 1) ? m[0].toString() : undefined;
  return root || '';
};

/** During development, use this URL to access the server. */
const apiDevService = 'http://localhost:3210';

/** Application state */
export const AppState = {
  usingDevServer: false,
  owner: 'TB_TrialMgmt',
  apiService: () => AppState.usingDevServer ? apiDevService : getRootUrl(),
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
