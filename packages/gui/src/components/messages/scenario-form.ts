import m, { FactoryComponent } from 'mithril';
import { IInject, IScenario } from 'trial-manager-models';
import { DateTimeControl } from '../ui/date-time-control';
import { DefaultMessageForm } from '.';

const DEFAULT_TRIAL_DURATION = 8;

/**
 * Default message form with a title and description.
 */
export const ScenarioForm: FactoryComponent<{ inject: IInject, onChange: () => void }> = () => {
  const setEndDate = (d: Date) => {
    const end = new Date(d.valueOf());
    end.setHours(d.getHours() + DEFAULT_TRIAL_DURATION);
    return end;
  };
  const setTime = (i: IScenario) => {
    state.startDate = i.startDate ? new Date(i.startDate) : new Date();
    state.endDate = i.endDate ? new Date(i.endDate) : setEndDate(state.startDate);
  };
  const state = {} as {
    startDate: Date;
    endDate: Date;
  };

  return {
    oninit: ({ attrs: { inject } }) => {
      setTime(inject);
    },
    onupdate: ({ attrs: { inject } }) => {
      setTime(inject);
    },
    view: ({ attrs }) => {
      const { onChange } = attrs;
      const inject = attrs.inject as IScenario;

      return [
        m(DefaultMessageForm, { inject }),
        m(DateTimeControl, {
          class: 'col s12 m6',
          prefix: 'Start',
          dt: state.startDate,
          onchange: (d: Date) => {
            inject.startDate = d.toUTCString();
            onChange();
          },
        }),
        m(DateTimeControl, {
          class: 'col s12 m6',
          prefix: 'End',
          icon: 'timer_off',
          dt: state.endDate,
          onchange: (d: Date) => {
            inject.endDate = d.toUTCString();
            onChange();
          },
        }),
      ];
    },
  };
};
