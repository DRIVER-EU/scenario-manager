import m, { Component } from 'mithril';
import { Icon, DatePicker, TimePicker } from 'mithril-materialized';
import { padLeft } from '../../utils/utils';

interface ITimePickerTime {
  /** Hours */
  h: number;
  /** Minutes */
  m: number;
}

export const DateTimeControl = () => {
  const state = {
    time: '09:00',
    date: new Date(),
  };
  const getTime = () => state.date;
  return {
    oninit: ({ attrs }) => {
      const { dt } = attrs;
      if (dt) {
        state.date = new Date(dt);
        state.time = `${padLeft(state.date.getHours())}:${padLeft(state.date.getMinutes())}`;
      }
    },
    view: ({ attrs }) => {
      const { prefix, icon, onchange } = attrs;
      const changeTime = () => (onchange ? onchange(getTime()) : undefined);
      return m('.input-field.col.s12', { style: 'margin: 0 auto;'}, [
        m(Icon, { iconName: icon || 'timer', class: 'prefix', style: 'margin-top: 0.8em;' }),
        m('label[for=tp]', `${prefix} time:`),
        m('.list-inline', { style: 'margin-left: 1.6rem; margin-top: 0.7em;' }, [
          m(
            '.col.s6.m3.l2',
            m(TimePicker, {
              initialValue: state.time,
              twelveHour: false,
              onchange: (time: string) => {
                const regex = /(\d{1:2}):(\d{1:2})/g;
                const match = regex.exec(time);
                if (!match || match.length < 2) {
                  return;
                }
                const hrs = +match[1];
                const min = +match[2];
                state.date.setHours(hrs, min);
                changeTime();
              },
            })
          ),
          m(
            '.col.s6.m3.l2',
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
  } as Component<{
    prefix: string;
    icon?: string;
    dt?: Date;
    onchange?: (date: Date) => void;
  }>;
};
