import m from 'mithril';
import io, { Socket } from 'socket.io-client';
import { actions, IAppModel, states } from '.';
import {
  TimeState,
  ITimeManagement,
  deepEqual,
  IInjectSimStates,
  IInject,
  uniqueId,
  IConnectMessage,
  ISessionManagement,
  SessionState,
} from 'trial-manager-models';
import { getInjects } from '../utils';

// tslint:disable-next-line:no-console
let socket: Socket;

export const setupSocket = (autoConnect = true): Socket => {
  console.table(location.origin + '/tmt/');
  if (socket && socket.connected) {
    return socket;
  }
  const url = process.env.SERVER || location.origin;
  console.log('origin is ' + url);
  socket = io(url, { path: '/tmt/socket.io/' });

  socket.on('connect', () => {
    console.log('Websocket connected');
    socket.emit('test-bed-connect');
  });
  // socket.on('disconnect', () => log('Disconnected'));
  socket.on('connect_error', (err: Error) => {
    console.log('Websocket error ' + JSON.stringify(err));
    console.log(`connect_error due to ${err.message}`);
    socket.close();
    if (autoConnect) {
      SocketSvc.socket = setupSocket(false);
    } else {
      console.error('connect_error: ' + JSON.stringify(err, null, 2));
    }
  });
  socket.on('exception', (data: any) => {
    console.warn('exception', data);
  });
  // socket.on('time-events', (data: unknown) => {
  //   console.log('time-events: ', data);
  // });
  socket.on('stateUpdated', (state: TimeState) => {
    const { update } = actions;
    // SimulationState.state = state;
    update({ exe: { time: { state } } } as Partial<IAppModel>);
  });
  socket.on('time', (time: ITimeManagement) => {
    const { update } = actions;
    update({ exe: { time } } as Partial<IAppModel>);
  });
  socket.on('is-connected', async (data: IConnectMessage) => {
    console.log('kafkaTopics');
    const { update } = actions;
    const { session = {} as Partial<ISessionManagement>, isConnected, time, host } = data;
    await actions.updateSession(Object.assign({ tags: undefined }, session));
    const kafkaTopics = await SocketSvc.getKafkaTopics();
    actions.updateKafkaTopics(kafkaTopics);
    console.log(kafkaTopics);
    update({
      exe: {
        sessionControl: {
          activeSession: session.state === SessionState.Started || session.state === SessionState.Initializing,
          isConnected,
          host,
          realtime: time?.simulationTime ? Math.abs(time?.simulationTime - Date.now()) < 10000 : true,
        },
        time,
      },
    } as Partial<IAppModel>);
  });
  socket.on('injectStates', (injectStates: IInjectSimStates) => {
    const { update } = actions;
    const { exe } = states();
    const { injectStates: curInjectStates, trial } = exe;
    if (deepEqual(curInjectStates, injectStates)) {
      return;
    }
    if (injectStates) {
      trial.injects = trial.injects.map((i) => ({ ...i, ...injectStates[i.id] }));
    }
    update({ exe: { trial, injectStates } } as Partial<IAppModel>);
    m.redraw();
  });
  socket.on('updatedInject', (i: IInject) => {
    const { update } = actions;
    const {
      exe: { trial },
    } = states();
    trial.injects = getInjects(trial).map((s) => (s.id === i.id ? i : s));
    update({ exe: { trial } } as Partial<IAppModel>);
  });
  socket.on('createdInject', (i: IInject) => {
    const { update } = actions;
    const {
      exe: { trial },
    } = states();
    i.id = i.id || uniqueId();
    trial.injects && trial.injects.push(i);
    update({ exe: { trial } } as Partial<IAppModel>);
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
  getKafkaTopics: async () => {
    return await new Promise((resolve) => {
      console.log('SOCKET SERVICE');
      SocketSvc.socket.emit('getKafkaTopics', (data: string[]) => {
        resolve(data as string[]);
      });
    });
  },
} as {
  socket: Socket;
  getKafkaTopics: () => Promise<string[]>;
};
