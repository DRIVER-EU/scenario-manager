import m, { FactoryComponent } from 'mithril';
import { SocketSvc } from '../../services';
import { ITimeMessage, deepCopy } from 'trial-manager-models';
import { formatTime } from '../../utils';

export const StatusBar: FactoryComponent<null> = () => {
  const socket = SocketSvc.socket;
  const sbState = {
    receivedTime: Date.now(),
    time: {} as ITimeMessage,
    progressTimeHandler: -1,
  };
  const updateTime = (time: ITimeMessage) => {
    sbState.receivedTime = Date.now(),
    sbState.time = deepCopy(time);
    // m.redraw();
  };
  const progressTime = (dom: Element) => () => {
    const now = Date.now();
    if (!sbState.time || !sbState.time.trialTime) { return; }
    if (typeof sbState.time.trialTimeSpeed !== undefined) {
      const delta = now - sbState.receivedTime;
      sbState.time.timeElapsed += delta;
      sbState.time.trialTime += delta * sbState.time.trialTimeSpeed;
    }
    sbState.receivedTime = now;
    m.render(dom, render());
  };

  const render = () => {
    const { trialTime, trialTimeSpeed, timeElapsed, state } = sbState.time;
    if (typeof state === 'undefined') {
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
      sbState.progressTimeHandler = setInterval(timer, 500);
    },
    view: () => m('div'),
  };
};
