import m from 'mithril';
import { ISystemLog } from 'trial-manager-models';
import { MeiosisComponent } from '../../services';
import { padLeft } from '../../utils';

export const KafkaLogs: MeiosisComponent = () => {
  const formatTime = (time: number) => {
    const date = new Date(time);
    return `${padLeft(date.getHours())}:${padLeft(date.getMinutes())}:${padLeft(date.getSeconds())}`;
  };

  const toTableRow = (log: ISystemLog) => {
    return [m('tr', [m('td', formatTime(log.dateTimeSent)), m('td', log.level), m('td', log.id), m('td', log.log)])];
  };

  return {
    view: ({ attrs: { state } }) => {
      const { logs } = state.app;
      logs.sort((a: ISystemLog, b: ISystemLog) => {
        return b.dateTimeSent - a.dateTimeSent;
      })

      return m(
        '.row',
        m(
          '.col.s12.sb.xlarge.sb-hor',
          { style: 'padding: 0' },
          logs.length === 0
            ? m('p.center', 'No logs available')
            : m('table.highlight', [
                m('thead', m('tr', [m('th', 'Time'), m('th', 'Level'), m('th', 'Sender'), m('th', 'Message')])),
                m('tbody', logs.map(toTableRow)),
              ])
        )
      );
    },
  };
};
