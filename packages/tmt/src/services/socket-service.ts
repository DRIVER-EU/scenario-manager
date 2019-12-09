import io from 'socket.io-client';
import { TimeState, SimulationState, ITimeMessage } from 'trial-manager-models';
import { AppState } from '../models';

// tslint:disable-next-line:no-console
const log = console.log;
let socket: SocketIOClient.Socket;

const setupSocket = (autoConnect = true) => {
  if (socket && socket.connected) {
    return socket;
  }
  socket = autoConnect ? io() : io(AppState.apiService());

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
  socket.on('time', (time: ITimeMessage) => {
    // log(`Time message received: ${time.trialTime}`);
    SimulationState.trialTime = time.trialTime || new Date().setHours(12, 0, 0).valueOf();
    SimulationState.trialTimeSpeed = time.trialTimeSpeed;
    SimulationState.timeElapsed = time.timeElapsed;
    window.clearInterval(handler);
    if (time.trialTimeSpeed > 0) {
      const secDuration = 1000;
      handler = window.setInterval(() => {
        SimulationState.trialTime += secDuration;
      }, secDuration / time.trialTimeSpeed);
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
