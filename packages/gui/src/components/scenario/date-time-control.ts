import { iconPrefix } from './../../utils/html';
import m, { Component } from 'mithril';
import '../../../node_modules/mithril-timepicker/src/style.css';
import '../../../node_modules/mithril-datepicker/src/style.css';
import TimePicker, { ITimePickerTime } from 'mithril-timepicker';
import DatePicker from 'mithril-datepicker';

export const DateTimeControl = () => {
  const state = {
    time: { h: 9, m: 0 } as ITimePickerTime,
    date: new Date(),
  };
  const getTime = () => state.date;
  return {
    oninit: ({ attrs }) => {
      const { dt } = attrs;
      if (dt) {
        state.date = new Date(dt);
        state.time = { h: state.date.getHours(), m: state.date.getMinutes() };
      }
    },
    view: ({ attrs }) => {
      const { prefix, icon, onchange } = attrs;
      const changeTime = () => onchange ? onchange(getTime()) : undefined;
      return m('.time-control.input-field', [
        m('div', [
          iconPrefix(icon || 'timer'),
          m('label[for=tp]', `${prefix} time:`),
          m('ul.list-inline', { style: 'margin-left: 3rem;' }, [
            m(
              'li',
              m(TimePicker, {
                time: state.time,
                tfh: true,
                onchange: (time: ITimePickerTime) => {
                  state.date.setHours(time.h, time.m);
                  changeTime();
                },
              })
            ),
            m(
              'li',
              m(DatePicker, {
                date: state.date,
                weekStart: 1,
                onchange: (d: Date) => {
                  state.date = d;
                  changeTime();
                },
              })
            ),
          ]),
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
