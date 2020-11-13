import m from 'mithril';
import { TimeControl } from './time-control';
import { MeiosisComponent } from '../../services';
import { FlatButton, Select, ISelectOptions, TextInput, TextArea, InputCheckbox, Icon } from 'mithril-materialized';
import { IScenario, InjectType, ISessionManagement, SessionState, uniqueId, TimeState } from '../../../../models';
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
      const session = {
        id: s.id || uniqueId(),
        name: s.name || 'New session',
        state: SessionState.Started,
        tags: {
          trialId: trial.id,
          trialName: trial.title,
          scenarioId: scenario?.id || '',
          scenarioName: scenario?.title || '',
          comment: s.tags?.comment || '',
        },
      };

      const disabled = sessionControl.activeSession;
      const isConnected = sessionControl?.isConnected;
      const options = scenarios.map((s) => ({ id: s.id, label: s.title }));

      if (session && !session.name) {
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
  let scenario = undefined as IScenario | undefined;

  return {
    oninit: async ({
      attrs: {
        state: {
          app,
          exe: { trial = app.trial, scenarioId = app.scenarioId },
        },
      },
    }) => {
      scenario = getInject(trial, scenarioId) as IScenario;
      console.log('SC scenario', scenario);
    },
    view: ({ attrs: { state, actions } }) => {
      const { session, sessionControl, time } = state.exe;
      const { isConnected } = sessionControl;
      const { updateSessionControl } = actions;
      const { realtime, activeSession } = sessionControl;
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
                  scenario,
                  isConnected,
                  time,
                  canStart,
                  realtime,
                })
            : undefined
        ),
      ];
    },
  };
};
