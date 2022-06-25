import m from 'mithril';
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
  return {
    view: ({ attrs: { state, actions, options = { editing: true } } }) => {
      const { scenario } = getActiveTrialInfo(state);
      const { updateInject } = actions;
      if (!scenario) return;
      const disabled = !options.editing;

      const startDate = scenario.startDate ? new Date(scenario.startDate) : new Date();
      const endDate = scenario.endDate
        ? new Date(scenario.endDate)
        : new Date(startDate.valueOf() + DEFAULT_TRIAL_DURATION * 3600000);
      if (endDate < startDate) {
        M.toast({ html: 'End time must be later than start time!', classes: 'orange' });
      }
      return [
        m(DefaultMessageForm, { state, actions, options }),
        [
          m(DateTimeControl, {
            key: Date.now(),
            className: 'col s12 m6',
            prefix: 'Start',
            disabled,
            dt: startDate,
            onchange: (d: Date) => {
              scenario.startDate = d.toISOString();
              updateInject(scenario);
            },
          }),
          m(DateTimeControl, {
            key: Date.now(),
            className: 'col s12 m6',
            prefix: 'End',
            disabled,
            icon: 'timer_off',
            dt: endDate,
            onchange: (d: Date) => {
              scenario.endDate = d.toISOString();
              updateInject(scenario);
            },
          }),
        ],
        m(Checklist, { state, actions }),
      ];
    },
  };
};
