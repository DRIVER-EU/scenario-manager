import m, { FactoryComponent } from 'mithril';
import { AppState } from '../../models';
import { SocketSvc } from '../../services';
import { ITimeMessage, TimeState, deepCopy } from 'trial-manager-models';
import { formatTime } from '../../utils';

export const StatusBar: FactoryComponent<null> = () => {
  const socket = SocketSvc.socket;
  const sbState = {
    receivedTime: Date.now(),
    progressTimeHandler: -1,
  };
  const updateTime = (time: ITimeMessage) => {
    sbState.receivedTime = Date.now(),
    AppState.time = deepCopy(time);
  };
  const progressTime = (dom: Element) => () => {
    const now = Date.now();
    if (!AppState.time || !AppState.time.trialTime) { return; }
    if (typeof AppState.time.trialTimeSpeed !== undefined) {
      const delta = now - sbState.receivedTime;
      AppState.time.timeElapsed += delta;
      AppState.time.trialTime += delta * AppState.time.trialTimeSpeed;
    }
    sbState.receivedTime = now;
    m.render(dom, render());
  };

  const render = () => {
    const { trialTime, trialTimeSpeed, timeElapsed, state } = AppState.time;
    if (typeof state === 'undefined' || state === TimeState.Idle) {
      return undefined;
    }
    const dt = new Date(trialTime);
    return m('.statusbar.center-align', [
      m('span', state),
      m('span', '|'),
      m('span', `${trialTimeSpeed}x`),
      m('span', '|'),
      m('span', `${formatTime(dt)}, ${dt.toDateString()}`),
      m('span', '|'),
      m('span', `Elapsed ${formatTime(new Date(timeElapsed), true, true)}`),
    ]);
  };

  return {
    oninit: () => {
      socket.on('time', updateTime);
    },
    onremove: () => {
      socket.off('time', updateTime);
      clearInterval(sbState.progressTimeHandler);
    },
    oncreate: ({ dom }) => {
      const timer = progressTime(dom);
      sbState.progressTimeHandler = setInterval(timer, 500) as unknown as number;
    },
    view: () => m('div'),
  };
};
