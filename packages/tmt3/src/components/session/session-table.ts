import m from 'mithril';
import { MeiosisComponent } from '../../services';
import {
  IExecutingInject,
  IInjectSimState,
  InjectType,
  InjectState,
  UserRole,
  ITrial,
  IScenario,
} from '../../../../models';
import { ITimelineItem } from 'mithril-scenario-timeline';
import {
  injectToTimelineItemFactory,
  padLeft,
  getMessageIconFromTemplate,
  getUsersByRole,
  getActiveTrialInfo,
  getInjects,
  getInject,
  calcStartEndTimes,
} from '../../utils';

export const SessionTable: MeiosisComponent = () => {
  let updater: number;
  let trial: ITrial;
  let scenarioStartTime: Date;
  let executingInjects = [] as Array<ITimelineItem & IExecutingInject>;
  let getMessageIcon: (topic?: string) => string;
  let serverTime: Date;

  const formatTime = (d: Date) => `${padLeft(d.getHours())}:${padLeft(d.getMinutes())}:${padLeft(d.getSeconds())}`;

  const getRole = (trial: ITrial, roleId: string) => {
    const r = getUsersByRole(trial, UserRole.ROLE_PLAYER)
      .filter((role) => role.id === roleId)
      .shift();
    return r ? r.name : '';
  };

  const curTime = {
    view: () => m('tr.active', { style: 'font-size: 0; line-height: 0' }, m('td[colspan=6]')),
  };

  const toTableRow = (ei: ITimelineItem & IExecutingInject, i: number, arr: ITimelineItem[]) => {
    const st = new Date((scenarioStartTime.getTime() / 1000 + ei.startTime) * 1000) || 0;
    const next =
      i < arr.length - 1 ? new Date((scenarioStartTime.getTime() / 1000 + arr[i + 1].startTime) * 1000) || 0 : Infinity;
    const isDone = ei.state === InjectState.EXECUTED;
    const role = ei.condition && ei.condition.rolePlayerId ? getRole(trial, ei.condition.rolePlayerId) : '−';
    const isActive = st <= serverTime && serverTime <= next;
    const isStarting = i === 0 && !isActive && serverTime <= next;
    return [
      isStarting && m(curTime),
      m(`tr${isActive ? '.active' : ''}${isDone ? '.done' : ''}`, [
        m('td', formatTime(st)),
        m('td', m('i.material-icons', getMessageIcon(ei.topic))),
        m('td', role),
        m('td', ei.title),
        m('td', ei.description),
        m(
          'td',
          ei.state === InjectState.EXECUTED
            ? m('i.material-icons', 'check')
            : m('i.material-icons', 'check_box_outline_blank')
        ),
      ]),
    ];
  };

  const sortByTime = (a: ITimelineItem, b: ITimelineItem) => {
    const stA = a.startTime || 0;
    const stB = b.startTime || 0;
    return stA < stB ? -1 : 1;
  };

  return {
    oninit: async ({
      attrs: {
        state: {
          app: { templates },
          exe: { trial: tr, scenarioId, scenarioStartTime: sst },
        },
      },
    }) => {
      getMessageIcon = getMessageIconFromTemplate(templates);
      updater = window.setInterval(() => m.redraw(), 1000);
      trial = tr;
      const scenario = getInject(trial, scenarioId) as IScenario;
      scenarioStartTime =
        scenario && scenario.startDate
          ? new Date(scenario.startDate)
          : Object.prototype.toString.call(sst) === '[object Date]'
          ? sst
          : new Date();
    },
    onbeforeremove: () => window.clearInterval(updater),
    view: ({ attrs: { state } }) => {
      const { treeState, trial } = getActiveTrialInfo(state);
      const { injectStates, time } = state.exe;
      const injects = getInjects(trial);

      const injectToTimelineItem = injectToTimelineItemFactory(injectStates, treeState);
      executingInjects = calcStartEndTimes(
        injects
          .filter((i) => injectStates.hasOwnProperty(i.id))
          .map(
            (i) =>
              ({
                ...i,
                ...injectStates[i.id],
              } as IExecutingInject & IInjectSimState)
          )
          .map(injectToTimelineItem)
      );

      serverTime = time && time.simulationTime ? new Date(time.simulationTime) : new Date();

      const tli = executingInjects.filter((i) => i.type === InjectType.INJECT).sort(sortByTime);

      return m(
        '.row',
        m(
          '.col.s12.sb.large.sb-hor',
          { style: 'padding: 0' },
          executingInjects.length === 0
            ? m('p.center', 'No active scenario loaded')
            : m('table.highlight', [
                m(
                  'thead',
                  m('tr', [
                    m('th', 'Time'),
                    m('th', 'Type'),
                    m('th', 'Role'),
                    m('th', 'Title'),
                    m('th', 'Description'),
                    m('th', 'Done'),
                  ])
                ),
                m('tbody', tli.map(toTableRow)),
              ])
        )
      );
    },
  };
};
