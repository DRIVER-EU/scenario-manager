import { TrialService } from './trial.service.js';

const trialService = () => {
  const ss = new TrialService();
  return {
    provide: 'TrialService',
    useFactory: () => {
      return ss;
    },
  };
};
export const trialServiceFactory = trialService();
