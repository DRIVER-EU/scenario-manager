import m from 'mithril';
import { IScenario } from '../../../../models';
import { DateTimeControl } from '../ui/date-time-control';
import { DefaultMessageForm } from '.';
import { Checklist } from '../ui/checklist';
import { MessageComponent } from '../../services';
import { getActiveTrialInfo } from '../../utils';

const DEFAULT_TRIAL_DURATION = 2;

/**
 * Default message form with a title and description.
 */
export const ScenarioForm: MessageComponent = () => {
  let onchangeDate: (s: IScenario, d: Date, type: 'start' | 'end') => void;
  return {
    oninit: ({
      attrs: {
        actions: { updateInject },
      },
    }) => {
      console.log('ONINIT ScenarioForm');
      onchangeDate = (s: IScenario, d: Date, type: 'start' | 'end') => {
        if (type === 'start') {
          s.startDate = d.toISOString();
        } else {
          s.endDate = d.toISOString();
        }
        updateInject(s);
      };
    },
    view: ({ attrs: { state, actions, options: { editing } = { editing: true } } }) => {
      const { scenario } = getActiveTrialInfo(state);
      if (!scenario) return;
      const disabled = !editing;

      const startDate = scenario.startDate ? new Date(scenario.startDate) : new Date();
      const endDate = scenario.endDate
        ? new Date(scenario.endDate)
        : new Date(startDate.valueOf() + DEFAULT_TRIAL_DURATION * 3600000);
      if (endDate < startDate) {
        M.toast({ html: 'End time must be later than start time!', classes: 'orange' });
      }
      return [
        m(DefaultMessageForm, { state, actions }),
        m(DateTimeControl, {
          className: 'col s12 m6',
          prefix: 'Start',
          disabled,
          dt: startDate,
          onchange: (d: Date) => onchangeDate(scenario, d, 'start'),
        }),
        m(DateTimeControl, {
          className: 'col s12 m6',
          prefix: 'End',
          disabled,
          icon: 'timer_off',
          dt: endDate,
          onchange: (d: Date) => onchangeDate(scenario, d, 'end'),
        }),
        m(Checklist, { state, actions }),
      ];
    },
  };
};
