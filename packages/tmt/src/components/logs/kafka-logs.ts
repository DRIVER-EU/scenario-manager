import m from 'mithril';
import { Icon } from 'mithril-materialized';
import { ISystemLog } from 'trial-manager-models';
import { MeiosisComponent } from '../../services';
import { padLeft } from '../../utils';

export const KafkaLogs: MeiosisComponent = () => {
  const logLevelToIcon = (logLevel: string) => {
    switch (logLevel) {
      case 'CRITICAL':
      case 'ERROR':
        return m(Icon, { iconName: 'report', className: 'small red-text' });
      case 'WARN':
        return m(Icon, { iconName: 'warning', className: 'small orange-text' });
      case 'INFO':
      case 'DEBUG':
      case 'SILLY':
      default:
        return m(Icon, { iconName: 'comment', className: 'small blue-text' });
    }
  };

  const formatTime = (time: number) => {
    const date = new Date(time);
    return `${padLeft(date.getHours())}:${padLeft(date.getMinutes())}:${padLeft(date.getSeconds())}`;
  };

  const toTableRow = (log: ISystemLog) => {
    return [
      m('tr', [
        m('td', formatTime(log.dateTimeSent)),
        m('td', logLevelToIcon(log.level)),
        m('td', log.id),
        m('td', log.log),
      ]),
    ];
  };

  return {
    view: ({ attrs: { state } }) => {
      const { logs } = state.app;
      logs.sort((a: ISystemLog, b: ISystemLog) => {
        return b.dateTimeSent - a.dateTimeSent;
      });

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
