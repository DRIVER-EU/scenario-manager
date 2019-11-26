import m, { FactoryComponent, Attributes } from 'mithril';
import { Icon, DatePicker, TimePicker } from 'mithril-materialized';
import { padLeft } from '../../utils';

export interface IDateTimeControl extends Attributes {
  prefix: string;
  icon?: string;
  dt?: Date;
  disabled?: boolean;
  onchange?: (date: Date) => void;
}

export const DateTimeControl: FactoryComponent<IDateTimeControl> = () => {
  const state = {
    time: '09:00',
    date: new Date(),
    hours: 9,
    min: 0,
  } as {
    hours: number;
    min: number;
    time: string;
    date: Date;
    onchange?: (d: Date) => void;
  };
  const timeRegex = /(\d{1,2}):(\d{1,2})/g;

  const getTime = () => {
    const { date, hours, min } = state;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, min, 0, 0);
  };

  const changeTime = () => (state.onchange ? state.onchange(getTime()) : undefined);

  return {
    oninit: ({ attrs: { onchange }}) => state.onchange = onchange,
    view: ({ attrs: { dt, prefix, icon, className = 'col s12', disabled } }) => {
      if (dt) {
        state.date = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        state.hours = dt.getHours();
        state.min = dt.getMinutes();
        state.time = `${padLeft(state.hours)}:${padLeft(state.min)}`;
      }
      return m('.input-field', { className, style: 'margin: 0 auto;' }, [
        m(Icon, { iconName: icon || 'timer', className: 'prefix', style: 'margin-top: 0.8em;' }),
        m('label[for=tp]', `${prefix} time:`),
        m('.list-inline', { style: 'margin-left: 1.6rem; margin-top: 0.7em;' }, [
          m(
            '.col.s5',
            m(TimePicker, {
              disabled,
              initialValue: state.time,
              twelveHour: false,
              onchange: (time: string) => {
                const match = timeRegex.exec(time);
                if (match && match.length >= 2) {
                  state.hours = +match[1];
                  state.min = +match[2];
                  state.time = `${padLeft(state.hours)}:${padLeft(state.min)}`;
                }
                changeTime();
              },
            })
          ),
          m(
            '.col.s7',
            m(DatePicker, {
              disabled,
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
