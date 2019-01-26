import { TrialService } from './trial.service';

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
