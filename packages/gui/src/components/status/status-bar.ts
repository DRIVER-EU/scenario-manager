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
    // console.log(`Status-bar updateTime: ` + JSON.stringify(time));
    (sbState.receivedTime = Date.now()), (AppState.time = deepCopy(time));
  };
  const progressTime = (dom: Element) => () => {
    const now = Date.now();
    const delta = now - sbState.receivedTime;
    if (!AppState.time) {
      return;
    }
    AppState.time.timeElapsed += delta;
    if (AppState.time.trialTimeSpeed) {
      AppState.time.trialTime += delta * AppState.time.trialTimeSpeed;
    }
    sbState.receivedTime = now;
    m.render(dom, render());
  };

  const render = () => {
    const { trialTime, trialTimeSpeed, timeElapsed, state } = AppState.time;
    if (typeof state === 'undefined') {
      return undefined;
    }
    const hasTimeInfo = state === TimeState.Paused || state === TimeState.Started || state === TimeState.Stopped;

    const dt = new Date(trialTime);
    return m('.statusbar.center-align', [
      AppState.sessionControl.host
        ? [m('span', `Connected to ${AppState.sessionControl.host}`), m('span', '|')]
        : undefined,
      m('span', state),
      m('span', '|'),
      m('span', hasTimeInfo ? `${trialTimeSpeed}x` : ''),
      m('span', '|'),
      m('span', hasTimeInfo ? `${formatTime(dt)}, ${dt.toDateString()}` : ''),
      m('span', '|'),
      m('span', hasTimeInfo ? `Elapsed ${formatTime(new Date(timeElapsed), true, true)}` : ''),
    ]);
  };

  return {
    oninit: () => socket.on('time', updateTime),
    onremove: () => {
      socket.off('time', updateTime);
      clearInterval(sbState.progressTimeHandler);
    },
    oncreate: ({ dom }) => {
      const timer = progressTime(dom);
      sbState.progressTimeHandler = (setInterval(timer, 500) as unknown) as number;
    },
    view: () => m('div'),
  };
};
