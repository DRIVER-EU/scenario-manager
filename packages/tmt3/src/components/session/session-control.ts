import m from 'mithril';
import { TimeControl } from './time-control';
import { MeiosisComponent } from '../../services';
import { FlatButton, Select, ISelectOptions, TextInput, TextArea, InputCheckbox, Icon } from 'mithril-materialized';
import { IScenario, InjectType, SessionState, uniqueId, TimeState, UserRole } from 'trial-manager-models';
import { getInjectIcon, getInject, getInjects, isScenario, getUserById, hasUserRole } from '../../utils';

/** Helper component to specify the session id, name, comments */
const SessionSettings: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: { app, exe },
        actions: { selectScenario, selectInject, updateSession, startSession, stopSession },
      },
    }) => {
      const trial = exe.trial.id ? exe.trial : app.trial;
      const { time, session: s, sessionControl, scenarioId, trialId, userId } = exe;
      const scenarios = getInjects(trial).filter(isScenario);
      const scenario = getInject(trial, scenarioId) as IScenario;
      const session = {
        id: s.id || uniqueId(),
        name: s.name || 'New session',
        state: SessionState.Started,
        tags: {
          trialId: trialId,
          trialName: trial.title,
          scenarioId: scenarioId || '',
          scenarioName: scenario?.title || '',
          comment: s.tags?.comment || '',
        },
      };
      const loggedInUser = getUserById(trial, userId);
      const disabled = sessionControl.activeSession || !loggedInUser || !hasUserRole(loggedInUser, UserRole.EXCON);
      const isConnected = sessionControl?.isConnected;
      const options = scenarios.map((s) => ({ id: s.id, label: s.title }));

      if (session && !session.name) {
        session.name = 'New session';
      }
      return [
        m('.row', [
          m(
            '.col.s12',
            { style: 'margin-top: 12px;' },
            m(Select, {
              label: 'Run scenario',
              checkedId: scenario ? scenario.id : undefined,
              options,
              disabled,
              iconName: getInjectIcon(InjectType.SCENARIO),
              onchange: (ids) => {
                const id = ids instanceof Array ? ids[0] : ids;
                selectScenario(id as string);
                selectInject(id as string);
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
  return {
    view: ({ attrs: { state, actions } }) => {
      const { sessionControl, time, trial, userId } = state.exe;
      const { isConnected } = sessionControl;
      const { updateSessionControl } = actions;
      const { realtime, activeSession } = sessionControl;
      const iconName = time
        ? time.state === TimeState.Reset
          ? 'timer'
          : time.state === TimeState.Stopped
          ? 'timer_off'
          : 'access_time'
        : 'access_time';

      const loggedInUser = getUserById(trial, userId);
      const disabled = !loggedInUser || !hasUserRole(loggedInUser, UserRole.EXCON);

      return [
        m(
          '.row',
          {
            style: 'color: #b4790c',
          },
          m('.col.s12', m('h4', 'Session Control')),
          m(SessionSettings, { state, actions }),
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
                    disabled,
                    onchange: (s) => {
                      sessionControl.realtime = s;
                      updateSessionControl(sessionControl);
                    },
                  })
                )
              ),
          ])
        ),
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
                      m(TimeControl, { state, actions, options: { style: 'margin-left: 3em' } }),
                    ])
                  )
                )
              : m(TimeControl, { state, actions })
            : undefined
        ),
      ];
    },
  };
};
