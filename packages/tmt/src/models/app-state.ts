import { ITimeManagement, ISessionManagement, IInjectSimStates, IInject } from '../../../models';
import { messageBus } from '../services';

const getRootUrl = () => {
  // Regex matching everything until the first hash symbol, so should also be able to deal with route rewriting...
  const regex = /https?:\/\/.*(?=\/#)/i;
  const route = document.location.href;
  const m = route.match(regex);
  return m && m.length === 1 ? m[0].toString() : '';
};

/** During development, use this URL to access the server. */
const apiDevService = 'http://localhost:3210';

/** Application state */
export const AppState = {
  owner: 'TB_TrialMgmt',
  apiService: () => (SERVICE_URL ? SERVICE_URL : getRootUrl()),
  time: {} as ITimeManagement,
  sessionControl: {
    isConnected: false,
    activeSession: false,
    realtime: false,
    host: '',
  },
  scenarioStartTime: new Date(),
  session: {
    id: '1',
    name: '',
    trialId: '',
    scenarioId: '',
    comments: '',
  } as Partial<ISessionManagement>,
  scenarioId: '',
  injectStates: {} as IInjectSimStates,
  useDevServer: () => {
    // console.warn('Switching to dev server');
    messageBus.publish({ channel: 'apiServer', topic: 'update', data: AppState.apiService() });
  },
  copiedInjectIsCut: false,
  copiedInjects: undefined as undefined | IInject | IInject[],
};
