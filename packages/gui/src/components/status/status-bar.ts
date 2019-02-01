import m, { FactoryComponent } from 'mithril';
import { SocketSvc } from '../../services';
import { ITimeMessage } from '../../models';
import { deepCopy, formatTime } from '../../utils';

export const StatusBar: FactoryComponent<null> = () => {
  const socket = SocketSvc.socket;
  const sbState = {
    receivedTime: Date.now(),
    time: {} as ITimeMessage,
    handle: -1,
  };
  const updateTime = (time: ITimeMessage) => {
    sbState.receivedTime = Date.now(),
    sbState.time = deepCopy(time);
    m.redraw();
  };
  const progressTime = () => {
    const now = Date.now();
    if (typeof sbState.time.trialTimeSpeed !== undefined) {
      const delta = now - sbState.receivedTime;
      sbState.time.timeElapsed += delta;
      sbState.time.trialTime += delta * sbState.time.trialTimeSpeed;
    }
    sbState.receivedTime = now;
    m.redraw();
  };

  return {
    oninit: () => {
      socket.on('time', updateTime);
      sbState.handle = setInterval(progressTime, 500);
    },
    onremove: () => {
      socket.off('time', updateTime);
      clearInterval(sbState.handle);
    },
    view: () => {
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
        m('span', `Elapsed ${formatTime(new Date(timeElapsed))}`),
      ]);
    },
  };
};
