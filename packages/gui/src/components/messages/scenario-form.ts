import m, { FactoryComponent } from 'mithril';
import { IInject, IScenario } from 'trial-manager-models';
import { DateTimeControl } from '../ui/date-time-control';
import { DefaultMessageForm } from '.';
import { Checklist } from '../ui/checklist';

const DEFAULT_TRIAL_DURATION = 8;

/**
 * Default message form with a title and description.
 */
export const ScenarioForm: FactoryComponent<{ inject: IInject; onChange: () => void; }> = () => {
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
      const scenario = attrs.inject as IScenario;

      return [
        m(DefaultMessageForm, { inject: scenario }),
        m(DateTimeControl, {
          class: 'col s12 m6',
          prefix: 'Start',
          dt: state.startDate,
          onchange: (d: Date) => {
            scenario.startDate = d.toUTCString();
            onChange();
          },
        }),
        m(DateTimeControl, {
          class: 'col s12 m6',
          prefix: 'End',
          icon: 'timer_off',
          dt: state.endDate,
          onchange: (d: Date) => {
            scenario.endDate = d.toUTCString();
            onChange();
          },
        }),
        m(Checklist, {
          scenario,
          onChange,
        }),
      ];
    },
  };
};
