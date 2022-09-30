import m from 'mithril';
import { Icon, ISelectOptions, Select, TextInput } from 'mithril-materialized';
import { ISystemLog } from 'trial-manager-models';
import { MeiosisComponent } from '../../services';
import { padLeft } from '../../utils';

export const KafkaLogs: MeiosisComponent = () => {
  let log_level_filter = [] as Array<string>;
  let service_filter = [] as Array<string>;
  let text_filter = '' as string;

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
      let { logs } = state.app;
      logs.sort((a: ISystemLog, b: ISystemLog) => {
        return b.dateTimeSent - a.dateTimeSent;
      });

      const services = Array.from(new Set(logs.map((log: ISystemLog) => log.id)));

      logs = logs.filter((log: ISystemLog) => {
        return (
          // First check the text filter. If there is text, check the fields using || logic
          (text_filter.length > 0 ? log.level.includes(text_filter) || log.id.includes(text_filter) || log.log.includes(text_filter) : true) &&
          // Then check the log level. If there is a filter, check the level field
          (log_level_filter.length > 0 ? log_level_filter.includes(log.level) : true) &&
          // Then check the service filter. If there is a filter, check the id field
          (service_filter.length > 0 ? service_filter.includes(log.id) : true)
        );
      });

      return m(
        '.row',
        m(Select, {
          className: 'col s4',
          multiple: true,
          placeholder: 'Choose filter...',
          label: "Filter Log Level",
          onchange: (v) => {
            if (v && v instanceof Array) {
              log_level_filter = v as Array<string>;
            }
          },
          options: [
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'ERROR', label: 'Error' },
            { id: 'WARN', label: 'Warning' },
            { id: 'INFO', label: 'Information' },
            { id: 'DEBUG', label: 'Debug' },
            { id: 'SILLY', label: 'Silly' },
          ],
        } as ISelectOptions),
        m(Select, {
          className: 'col s4',
          multiple: true,
          placeholder: 'Choose filter...',
          label: "Filter Sender",
          onchange: (v) => {
            if (v && v instanceof Array) {
              service_filter = v as Array<string>;
            }
          },
          options: services.map((service: string) => {
            return { id: service, label: service };
          }),
        }),
        m(TextInput, {
          className: 'col s4',
          label: 'Search logs',
          iconName: 'search',
          onchange: (v) => {
            text_filter = v;
          },
        }),
        m(
          '.col.s12.sb.large.sb-hor',
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
