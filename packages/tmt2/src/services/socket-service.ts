import io from 'socket.io-client';
import { TimeState, SimulationState, ITimeManagement } from '../../../models';

// tslint:disable-next-line:no-console
const log = console.log;
let socket: SocketIOClient.Socket;

const setupSocket = (autoConnect = true) => {
  if (socket && socket.connected) {
    return socket;
  }
  socket = autoConnect ? io() : io(process.env.SERVER || location.origin);

  socket.on('connect', () => {
    log('Connected');
  });
  socket.on('time-events', (data: unknown) => {
    console.log('time-events: ', data);
  });
  socket.on('connect_error', (data: unknown) => {
    socket.close();
    if (autoConnect) {
      SocketSvc.socket = setupSocket(false);
    } else {
      console.error('event', data);
    }
  });
  socket.on('disconnect', () => log('Disconnected'));
  socket.on('stateUpdated', (state: TimeState) => {
    SimulationState.state = state;
  });
  let handler = -1;
  socket.on('time', (time: ITimeManagement) => {
    // log(`Time message received: ${time.trialTime}`);
    SimulationState.simulationTime = time.simulationTime || new Date().setHours(12, 0, 0).valueOf();
    SimulationState.simulationSpeed = time.simulationSpeed;
    if (time.tags?.timeElapsed) {
      console.log(time);
      SimulationState.tags = { timeElapsed: time.tags.timeElapsed };
    }
    window.clearInterval(handler);
    if (time.simulationSpeed && time.simulationSpeed > 0) {
      const secDuration = 1000;
      handler = window.setInterval(() => {
        if (!SimulationState.simulationTime) {
          SimulationState.simulationTime = 0;
        }
        SimulationState.simulationTime += secDuration;
      }, secDuration / time.simulationSpeed);
    }
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
