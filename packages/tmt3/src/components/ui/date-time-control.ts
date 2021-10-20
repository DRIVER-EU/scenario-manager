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
  let time = '09:00';
  let date = new Date();
  let hours = 9;
  let min = 0;
  const timeRegex = /(\d{1,2}):(\d{1,2})/g;

  const getTime = () => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, min, 0, 0);
  };

  return {
    view: ({ attrs: { dt, prefix, icon, className = 'col s12', disabled, onchange } }) => {
      if (dt) {
        date = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        hours = dt.getHours();
        min = dt.getMinutes();
        time = `${padLeft(hours)}:${padLeft(min)}`;
      }
      return m('.input-field', { className, style: 'margin: 0 auto;' }, [
        m(Icon, { iconName: icon || 'timer', className: 'prefix', style: 'margin-top: 0.8em;' }),
        m('label[for=tp]', `${prefix} time:`),
        m('.list-inline', { style: 'margin-left: 1.6rem; margin-top: 0.7em;' }, [
          m(
            '.col.s5',
            m(TimePicker, {
              disabled,
              initialValue: time,
              twelveHour: false,
              onchange: (time: string) => {
                const match = timeRegex.exec(time);
                if (match && match.length >= 2) {
                  hours = +match[1];
                  min = +match[2];
                  time = `${padLeft(hours)}:${padLeft(min)}`;
                }
                onchange && onchange(getTime());
              },
            })
          ),
          m(
            '.col.s7',
            m(DatePicker, {
              disabled,
              initialValue: date,
              onchange: (d: Date) => {
                date = d;
                onchange && onchange(getTime());
              },
            })
          ),
        ]),
      ]);
    },
  };
};
