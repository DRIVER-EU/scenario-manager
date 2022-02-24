import m from 'mithril';
import { MeiosisComponent, states } from '../../services';
import { ITimeManagement, TimeState } from 'trial-manager-models';
import { formatTime, formatMsec } from '../../utils';
import { ISessionControl } from '../../models';

export const StatusBar: MeiosisComponent<null> = () => {
  let receivedTime = Date.now();
  let progressTimeHandler = -1;

  const progressTime = (dom: Element) => () => {
    const now = Date.now();
    const delta = now - receivedTime;
    const state = states();
    const { time, sessionControl } = state.exe;
    if (!time) {
      return;
    }
    if (!time.tags) {
      time.tags = { timeElapsed: '0' };
    }
    time.tags.timeElapsed = (+time.tags.timeElapsed + delta).toString();
    if (time.simulationTime && time.simulationSpeed) {
      time.simulationTime += delta * time.simulationSpeed;
    }
    receivedTime = now;
    m.render(dom, render(time, sessionControl));
  };

  const render = (time: ITimeManagement, sessionControl: ISessionControl) => {
    const { simulationTime = 0, simulationSpeed = 0, tags, state } = time;
    const timeElapsed = tags && tags.timeElapsed ? +tags.timeElapsed : 0;
    const { host, isConnected } = sessionControl;
    if (typeof state === 'undefined') {
      return undefined;
    }
    const hasTimeInfo = state === TimeState.Paused || state === TimeState.Started || state === TimeState.Stopped;

    const dt = new Date(simulationTime || 0);
    return m('.statusbar.center-align', [
      host && isConnected ? [m('span', `Connected to ${sessionControl.host}`), m('span', '|')] : undefined,
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
    onremove: () => {
      clearInterval(progressTimeHandler);
    },
    oncreate: ({ dom }) => {
      const timer = progressTime(dom);
      progressTimeHandler = (setInterval(timer, 500) as unknown) as number;
    },
    view: () => m('div'),
  };
};
