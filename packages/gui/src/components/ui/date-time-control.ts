import m, { FactoryComponent, Attributes } from 'mithril';
import { Icon, DatePicker, TimePicker } from 'mithril-materialized';
import { padLeft } from '../../utils';

export interface IDateTimeControl extends Attributes {
  prefix: string;
  icon?: string;
  dt?: Date;
  onchange?: (date: Date) => void;
}

export const DateTimeControl: FactoryComponent<IDateTimeControl> = () => {
  const state = {
    time: '09:00',
    date: new Date(),
  };
  const getTime = () => new Date(state.date);
  return {
    view: ({ attrs }) => {
      const { prefix, icon, onchange, dt } = attrs;
      if (dt) {
        state.date = new Date(dt);
        state.time = `${padLeft(state.date.getUTCHours())}:${padLeft(state.date.getUTCMinutes())}`;
      }
      const changeTime = () => (onchange ? onchange(getTime()) : undefined);
      return m('.input-field', { class: attrs.class || 'col s12', style: 'margin: 0 auto;' }, [
        m(Icon, { iconName: icon || 'timer', class: 'prefix', style: 'margin-top: 0.8em;' }),
        m('label[for=tp]', `${prefix} time:`),
        m('.list-inline', { style: 'margin-left: 1.6rem; margin-top: 0.7em;' }, [
          m(
            '.col.s5',
            m(TimePicker, {
              initialValue: state.time,
              twelveHour: false,
              onchange: (time: string) => {
                const regex = /(\d{1,2}):(\d{1,2})/g;
                const match = regex.exec(time);
                if (!match || match.length < 2) {
                  return;
                }
                const hrs = +match[1];
                const min = +match[2];
                state.date.setUTCHours(hrs, min, 0, 0);
                changeTime();
              },
            })
          ),
          m(
            '.col.s7',
            m(DatePicker, {
              initialValue: state.date,
              onchange: (d: Date) => {
                state.date = d;
                changeTime();
              },
            })
          ),
        ]),
      ]);
    },
  };
};
