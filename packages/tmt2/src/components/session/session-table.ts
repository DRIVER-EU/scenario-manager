import m from 'mithril';
import { MeiosisComponent } from '../../services';
import { IExecutingInject, IInjectSimState, InjectType, InjectState, UserRole, ITrial } from '../../../../models';
import { ITimelineItem } from 'mithril-scenario-timeline';
import {
  injectToTimelineItemFactory,
  padLeft,
  getMessageIcon,
  getUsersByRole,
  getActiveTrialInfo,
  getInjects,
} from '../../utils';

export const SessionTable: MeiosisComponent = () => {
  let time = Date.now();
  let trial: ITrial;
  // let simulationSpeed = 1;
  let scenarioStartTime = new Date();
  // let lastTimeUpdate = Date.now();
  // let timeInterval = undefined as number | undefined;
  let executingInjects = [] as Array<IExecutingInject & IInjectSimState>;
  // let socket = SocketSvc.socket;

  // const updateTime = (t = {} as ITimeManagement) => {
  //   lastTimeUpdate = Date.now();
  //   time = t.simulationTime || 0;
  //   simulationSpeed = t.simulationSpeed || 1;
  // };

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
    const trialTime = time;
    const ttime = toTime(ei.delay);
    const next = i < arr.length - 1 ? toTime(arr[i + 1].delay) : new Date(ttime.valueOf() + 365 * 24 * 3600000);
    const isDone = ei.state === InjectState.EXECUTED;
    const role = ei.condition && ei.condition.rolePlayerId ? getRole(trial, ei.condition.rolePlayerId) : '−';
    const isActive = ttime.valueOf() <= trialTime && trialTime <= next.valueOf();
    const isStarting = i === 0 && !isActive && trialTime <= next.valueOf();
    return [
      isStarting && m(curTime),
      m(`tr${isActive ? '.active' : ''}${isDone ? '.done' : ''}`, [
        m('td', formatTime(ttime)),
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
    const delayA = a.delay || 0;
    const delayB = b.delay || 0;
    return delayA > delayB ? 1 : -1;
  };

  return {
    oninit: async ({
      attrs: {
        state: { exe },
      },
    }) => {
      trial = exe.trial;
    },
    view: ({ attrs: { state } }) => {
      const { treeState, trial } = getActiveTrialInfo(state);
      const { injectStates } = state.exe;
      const injects = getInjects(trial);
      // console.log(injects);
      executingInjects = injects
        .filter((i) => injectStates.hasOwnProperty(i.id))
        .map(
          (i) =>
            ({
              ...i,
              ...injectStates[i.id],
            } as IExecutingInject & IInjectSimState)
        );

      const injectToTimelineItem = injectToTimelineItemFactory(injectStates, treeState);
      const tli = executingInjects
        .filter((ei) => ei.type === InjectType.INJECT)
        .map(injectToTimelineItem)
        .sort(sortByTime);

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
