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
  getMessageIcon,
  getUsersByRole,
  getActiveTrialInfo,
  getInjects,
  getInject,
  calcStartEndTimes,
} from '../../utils';

export const SessionTable: MeiosisComponent = () => {
  let time = Date.now();
  let trial: ITrial;
  let scenarioStartTime = new Date();
  let executingInjects = [] as Array<ITimelineItem & IExecutingInject>;

  const toTime = (delayInSec = 0) => new Date(scenarioStartTime.valueOf() + delayInSec * 1000);

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
    const st = ei.startTime || 0;
    const next = i < arr.length - 1 ? arr[i + 1].startTime || 0 : Infinity;
    // const next = i < arr.length - 1 ? toTime(arr[i + 1].startTime) : new Date(ttime.valueOf() + 365 * 24 * 3600000);
    const isDone = ei.state === InjectState.EXECUTED;
    const role = ei.condition && ei.condition.rolePlayerId ? getRole(trial, ei.condition.rolePlayerId) : '−';
    const isActive = st <= time && time <= next;
    const isStarting = i === 0 && !isActive && time <= next;
    return [
      isStarting && m(curTime),
      m(`tr${isActive ? '.active' : ''}${isDone ? '.done' : ''}`, [
        m('td', formatTime(toTime(st))),
        m('td', m('i.material-icons', getMessageIcon(ei.messageType))),
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
          exe: { trial: tr, scenarioId },
        },
      },
    }) => {
      trial = tr;
      const scenario = getInject(trial, scenarioId) as IScenario;
      scenarioStartTime = (scenario && scenario.startDate && new Date(scenario.startDate)) || new Date();
    },
    view: ({ attrs: { state } }) => {
      const { treeState, trial } = getActiveTrialInfo(state);
      const { injectStates, time: t } = state.exe;
      time = (new Date(t.simulationTime || 0).valueOf() - scenarioStartTime.valueOf()) / 1000;
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
