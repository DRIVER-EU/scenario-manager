import m from 'mithril';
import { TimeControl } from './time-control';
import { SocketSvc, RunSvc, MeiosisComponent } from '../../services';
import {
  FlatButton,
  Select,
  ISelectOptions,
  TextInput,
  TextArea,
  InputCheckbox,
  Icon,
  ModalPanel,
} from 'mithril-materialized';
import {
  ITrial,
  IScenario,
  InjectType,
  IConnectMessage,
  ISessionManagement,
  SessionState,
  uniqueId,
  TimeState,
  ITimeManagement,
} from '../../../../models';
import { getInjectIcon, getInjects, getInject } from '../../utils';

const isComplete = ({ id: sessionId, name: sessionName }: Partial<ISessionManagement>) =>
  sessionId && sessionId.length && sessionName && sessionName.length > 1 ? true : false;

/** Helper component to specify the session id, name, comments */
const SessionSettings: MeiosisComponent = () => {
  let scenarios: IScenario[] = [];
  let scenario: IScenario | undefined;

  return {
    oninit: async ({
      attrs: {
        state: { app, exe },
        actions: { updateSession, selectScenario },
      },
    }) => {
      await updateSession();
      const { mode } = app;
      const isExecuting = mode === 'execute';
      const { trial, scenarioId } = isExecuting && exe.trial.id ? exe : app;
      scenarios = getInjects(trial).filter((i) => i.type === InjectType.SCENARIO);
      const id = scenarioId || (scenarios.length > 0 ? scenarios[0].id : undefined);
      scenario = getInject(trial, id);
      if (id && id !== exe.scenarioId) selectScenario(id);
    },
    view: ({
      attrs: {
        state: { app, exe },
        actions: { selectScenario, updateSession, startSession, stopSession },
      },
    }) => {
      const trial = exe.trial.id ? exe.trial : app.trial;
      const { time, session: s, sessionControl } = exe;
      const session = Object.assign(
        {},
        {
          id: uniqueId(),
          state: SessionState.Started,
          name: 'New session',
          tags: {
            trialId: trial.id,
            trialName: trial.title,
            scenarioId: scenario?.id,
            scenarioName: scenario?.title,
          },
        },
        s
      );

      const disabled = sessionControl.activeSession;
      const isConnected = sessionControl?.isConnected;
      const options = scenarios.map((s) => ({ id: s.id, label: s.title }));

      if (session && !session.name) {
        session.id = uniqueId();
        session.name = 'New session';
      }
      return [
        m('.row', [
          m(
            '.col.s12',
            m(Select, {
              label: 'Run scenario',
              checkedId: scenario ? scenario.id : undefined,
              options,
              disabled,
              iconName: getInjectIcon(InjectType.SCENARIO),
              onchange: (ids) => {
                const id = ids instanceof Array ? ids[0] : ids;
                selectScenario(id as string);
              },
            } as ISelectOptions)
          ),
        ]),
        !isConnected
          ? undefined
          : m('.row', [
              m(
                '.col.s12',
                m(TextInput, {
                  initialValue: session.name || '',
                  label: 'Session name',
                  iconName: 'title',
                  disabled,
                  isMandatory: true,
                  onchange: (v: string) => {
                    session.name = v;
                    updateSession(session);
                  },
                })
              ),
              m(
                '.col.s12',
                m(TextArea, {
                  initialValue: session.tags ? session.tags.comment : undefined,
                  label: 'Comments',
                  iconName: 'note',
                  disabled,
                  onchange: (v: string) => {
                    session.tags.comment = v;
                    updateSession(session);
                  },
                })
              ),
              m('.col.s12.input-field', [
                m(FlatButton, {
                  className: 'col s6',
                  iconName: 'directions_run',
                  label: 'Start session',
                  disabled,
                  onclick: async () => await startSession(session),
                }),
                m(FlatButton, {
                  className: 'col s6',
                  iconName: 'accessibility',
                  label: 'Stop session',
                  disabled:
                    !disabled || (time && time.state !== TimeState.Reset && time.state !== TimeState.Initialization),
                  onclick: async () => await stopSession(),
                }),
              ]),
            ]),
      ];
    },
  };
};

export const SessionControl: MeiosisComponent = () => {
  const socket = SocketSvc.socket;
  let scenario = undefined as IScenario | undefined;
  let time = {} as ITimeManagement;
  let disconnectModal = undefined as undefined | M.Modal;
  let isTestbedConnected: (data: IConnectMessage) => Promise<void>;

  const updateTime = (tm: ITimeManagement) => {
    // console.log('Time msg received: ' + JSON.stringify(tm));
    if (time.state !== tm.state || time.simulationSpeed !== tm.simulationSpeed) {
      time = tm;
      m.redraw();
    }
  };

  return {
    oninit: async () => {
      // state.scenarios = state.trial.injects.filter(i => i.type === InjectType.SCENARIO);
      socket.on('time', updateTime);
    },
    onremove: () => {
      socket.off('time', updateTime);
    },
    view: ({ attrs: { state, actions } }) => {
      const { session, sessionControl } = state.exe;
      const { isConnected } = sessionControl;
      const { updateSessionControl } = actions;
      const { realtime, activeSession } = sessionControl;
      // const key = scenario ? scenario.id : undefined;
      const canStart = activeSession && isComplete(session);
      const iconName = time
        ? time.state === TimeState.Reset
          ? 'timer'
          : time.state === TimeState.Stopped
          ? 'timer_off'
          : 'access_time'
        : 'access_time';
      return [
        m(
          '.row',
          m('.col.s12', [
            isConnected &&
              m(
                '.row',
                { style: 'margin: 10px 0 20px 0;' },
                m(
                  '.col.s6',
                  m(InputCheckbox, {
                    label: 'Real time',
                    checked: realtime,
                    onchange: (s) => {
                      sessionControl.realtime = s;
                      updateSessionControl(sessionControl);
                    },
                  })
                )
              ),
          ])
        ),
        m(SessionSettings, { state, actions }),
        m(
          'div',
          // { key },
          activeSession
            ? realtime
              ? m(
                  '.row',
                  m(
                    '.col.s12.m6',
                    m('.input-field.col.s12', [
                      m(Icon, { iconName, className: 'prefix' }),
                      m(TimeControl, {
                        style: 'margin-left: 3em',
                        scenario,
                        isConnected,
                        time,
                        canStart,
                        realtime,
                      }),
                    ])
                  )
                )
              : m(TimeControl, {
                  // style: 'margin-left: 3em',
                  scenario,
                  isConnected,
                  time,
                  canStart,
                  realtime,
                })
            : undefined
        ),
        // : undefined,
        m(ModalPanel, {
          onCreate: (modal) => {
            disconnectModal = modal;
          },
          id: 'disconnect',
          title: 'Are you certain you want to disconnect?',
          description: 'After disconnecting, you will not receive updates anymore.',
          buttons: [
            { label: 'No, bring me back to safety' },
            {
              label: 'Yes, I am sure!',
              onclick: () => socket.emit('test-bed-disconnect'),
            },
          ],
        }),
      ];
    },
  };
};
