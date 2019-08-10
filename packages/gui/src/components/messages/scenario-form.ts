import m, { FactoryComponent } from 'mithril';
import { IInject, IScenario } from 'trial-manager-models';
import { DateTimeControl } from '../ui/date-time-control';
import { DefaultMessageForm } from '.';
import { Checklist } from '../ui/checklist';

const DEFAULT_TRIAL_DURATION = 2;

/**
 * Default message form with a title and description.
 */
export const ScenarioForm: FactoryComponent<{
  inject: IInject;
  disabled?: boolean;
  onChange?: (inj?: IInject) => void;
}> = () => {
  return {
    view: ({ attrs }) => {
      const { onChange, disabled = false } = attrs;
      const scenario = attrs.inject as IScenario;
      const startDate = scenario.startDate ? new Date(scenario.startDate) : new Date();
      const endDate = scenario.endDate
        ? new Date(scenario.endDate)
        : new Date(startDate.valueOf() + DEFAULT_TRIAL_DURATION * 3600000);

      if (endDate < startDate) {
        M.toast({ html: 'End time must be later than start time!', classes: 'orange' });
      }
      return [
        m(DefaultMessageForm, { inject: scenario, disabled }),
        disabled
          ? undefined
          : [
              m(DateTimeControl, {
                className: 'col s12 m6',
                prefix: 'Start',
                dt: startDate,
                onchange: (d: Date) => {
                  scenario.startDate = d.toISOString();
                  if (onChange) {
                    onChange(scenario);
                  }
                },
              }),
              m(DateTimeControl, {
                className: 'col s12 m6',
                prefix: 'End',
                icon: 'timer_off',
                dt: endDate,
                onchange: (d: Date) => {
                  scenario.endDate = d.toISOString();
                  if (onChange) {
                    onChange(scenario);
                  }
                },
              }),
            ],
        m(Checklist, {
          disabled,
          scenario,
          onChange,
        }),
      ];
    },
  };
};
