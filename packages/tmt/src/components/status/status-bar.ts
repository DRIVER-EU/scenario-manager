import m, { FactoryComponent } from 'mithril';
import { AppState } from '../../models';
import { SocketSvc } from '../../services';
import { ITimeManagement, TimeState, deepCopy } from '../../../../models';
import { formatTime, formatMsec } from '../../utils';

export const StatusBar: FactoryComponent<null> = () => {
  const socket = SocketSvc.socket;
  const sbState = {
    receivedTime: Date.now(),
    progressTimeHandler: -1,
  };
  const updateTime = (time: ITimeManagement) => {
    // console.log(`Status-bar updateTime: ` + JSON.stringify(time));
    sbState.receivedTime = Date.now();
    AppState.time = deepCopy(time);
  };
  const progressTime = (dom: Element) => () => {
    const now = Date.now();
    const delta = now - sbState.receivedTime;
    if (!AppState.time) {
      return;
    }
    if (!AppState.time.tags) {
      AppState.time.tags = { timeElapsed: '0' };
    }
    AppState.time.tags.timeElapsed += delta;
    if (AppState.time.simulationTime && AppState.time.simulationSpeed) {
      AppState.time.simulationTime += delta * AppState.time.simulationSpeed;
    }
    sbState.receivedTime = now;
    m.render(dom, render());
  };

  const render = () => {
    const { simulationTime = 0, simulationSpeed = 0, tags, state } = AppState.time;
    const timeElapsed = tags && tags.timeElapsed ? +tags.timeElapsed : 0;
    const { host, isConnected } = AppState.sessionControl;
    if (typeof state === 'undefined') {
      return undefined;
    }
    const hasTimeInfo = state === TimeState.Paused || state === TimeState.Started || state === TimeState.Stopped;

    const dt = new Date(simulationTime || 0);
    return m('.statusbar.center-align', [
      host && isConnected ? [m('span', `Connected to ${AppState.sessionControl.host}`), m('span', '|')] : undefined,
      m('span', state),
      m('span', '|'),
      m('span', hasTimeInfo ? `${simulationSpeed}x` : ''),
      m('span', '|'),
      m('span', hasTimeInfo ? `${formatTime(dt)}, ${dt.toDateString()}` : ''),
      m('span', '|'),
      m('span', hasTimeInfo ? `Elapsed ${formatMsec(timeElapsed)}` : ''),
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
