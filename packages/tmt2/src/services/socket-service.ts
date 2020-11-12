import io from 'socket.io-client';
import { actions, IAppModel } from '.';
import { TimeState, ITimeManagement } from '../../../models';

// tslint:disable-next-line:no-console
const log = console.log;
let socket: SocketIOClient.Socket;

export const setupSocket = (autoConnect = true) => {
  if (socket && socket.connected) {
    return socket;
  }
  socket = autoConnect ? io() : io(process.env.SERVER || location.origin);

  socket.on('connect', () => log('Connected'));
  socket.on('disconnect', () => log('Disconnected'));
  socket.on('connect_error', (err: Error) => {
    socket.close();
    if (autoConnect) {
      SocketSvc.socket = setupSocket(false);
    } else {
      console.error('connect_error: ' + JSON.stringify(err, null, 2));
    }
  });
  socket.on('exception', (data: any) => {
    console.log('exception', data);
  });
  socket.on('time-events', (data: unknown) => {
    console.log('time-events: ', data);
  });
  socket.on('stateUpdated', (state: TimeState) => {
    const { update } = actions;
    // SimulationState.state = state;
    update({ exe: { time: { state } } } as Partial<IAppModel>);
  });
  // let handler = -1;
  socket.on('time', (time: ITimeManagement) => {
    const { update } = actions;
    update({ exe: { time } } as Partial<IAppModel>);
    // SimulationState.simulationTime = time.simulationTime || new Date().setHours(12, 0, 0).valueOf();
    // SimulationState.simulationSpeed = time.simulationSpeed;
    // if (time.tags?.timeElapsed) {
    //   console.log(time);
    //   SimulationState.tags = { timeElapsed: time.tags.timeElapsed };
    // }
    // window.clearInterval(handler);
    // if (time.simulationSpeed && time.simulationSpeed > 0) {
    //   const secDuration = 1000;
    //   handler = window.setInterval(() => {
    //     if (!SimulationState.simulationTime) {
    //       SimulationState.simulationTime = 0;
    //     }
    //     SimulationState.simulationTime += secDuration;
    //   }, secDuration / time.simulationSpeed);
    // }
  });
  return socket;
};
socket = setupSocket();

/**
 * The SocketSvc is a service to manage the socket connection
 * with the server.
 */
export const SocketSvc = {
  socket: socket || setupSocket(),
};
