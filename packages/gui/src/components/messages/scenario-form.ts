import m, { FactoryComponent } from 'mithril';
import { IInject, IScenario } from '../../models';
import { DateTimeControl } from '../ui/date-time-control';
import { DefaultMessageForm } from '.';

const DEFAULT_TRIAL_DURATION = 8;
/**
 * Default message form with a title and description.
 */
export const ScenarioForm: FactoryComponent<{ inject: IInject }> = () => {
  return {
    view: ({ attrs }) => {
      const inject = attrs.inject as IScenario;
      const startDate = inject.startDate || new Date();
      const endDate = inject.endDate || new Date(startDate.valueOf());
      if (!inject.endDate) {
        endDate.setHours(startDate.getHours() + DEFAULT_TRIAL_DURATION);
        inject.endDate = endDate;
      }

      return [
        m(DefaultMessageForm, { inject }),
        m(DateTimeControl, {
          class: 'col s12 m6',
          prefix: 'Start',
          dt: startDate,
          onchange: (d: Date) => {
            inject.startDate = d;
            m.redraw();
          },
        }),
        m(DateTimeControl, {
          class: 'col s12 m6',
          prefix: 'End',
          icon: 'timer_off',
          dt: endDate,
          onchange: (d: Date) => {
            inject.endDate = d;
            m.redraw();
          },
        }),
      ];
    },
  };
};
