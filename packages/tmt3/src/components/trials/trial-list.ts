import m from 'mithril';
import { TextInput, RoundIconButton, Icon, ModalPanel, Select } from 'mithril-materialized';
import { dashboardSvc, MeiosisComponent } from '../../services';
import { titleAndDescriptionFilter, padLeft } from '../../utils';
import { ITrialOverview, SessionState, TimeState, UserRole } from 'trial-manager-models';
import { Dashboards } from '../../models';

let ignoreActive: boolean;
let roleID: string;

export const TrialList: MeiosisComponent = () => {
  let filterValue: string | undefined;
  // let loaded = false;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${padLeft(d.getHours())}:${padLeft(d.getMinutes())}`;
  };

  return {
    oninit: async ({
      attrs: {
        actions: { loadTrials },
      },
    }) => {
      ignoreActive = false;
      //activeSession ? roles = await getRoles(session.tags?.trialId as string) : undefined
      await loadTrials();
      // loaded = true;
    },
    onupdate: ({
      attrs: {
        state: {
          exe: {
            sessionControl: { activeSession },
          },
        },
      },
    }) => {
      const elem = document.getElementById('session-running');
      const instance = M.Modal.init(elem as HTMLElement);
      instance && !instance.isOpen && !ignoreActive && activeSession ? instance.open() : undefined;
    },
    view: ({
      attrs: {
        state: {
          app: { trials },
          exe: {
            trial,
            sessionControl: { isConnected, activeSession },
            session,
            time: { state },
          },
        },
        actions: { loadTrial, newTrial, setPresetRole },
      },
    }) => {
      const { name, tags } = session;
      const trialId = tags ? tags.trialId || (session as any).trialId : undefined;
      const query = titleAndDescriptionFilter(filterValue);
      const filteredTrials = trials.filter(query);
      const apiService = process.env.SERVER || location.origin + '/tmt';
      console.table(session);
      console.table({ isConnected, activeSession });

      const options =
        trial.users &&
        trial.users
          .filter(
            (user) =>
              user.roles &&
              user.roles.some((role) => [UserRole.EXCON, UserRole.ROLE_PLAYER, UserRole.VIEWER].indexOf(role) >= 0)
          )
          .map((u) => {
            return { id: u.id, label: u.name };
          });

      return [
        m(ModalPanel, {
          fixedFooter: true,
          onCreate: (modal) => {
            modal.options.endingTop = '5%';
          },
          id: 'session-running',
          title: 'A Session is already running',
          description: m('div', [
            m(Select, {
              placeholder: 'Pick a role',
              className: 'inline large',
              options: options ? options : [],
              onchange: (v) => {
                roleID = v[0] as string;
              },
            }),
          ]),
          buttons: [
            {
              label: 'Cancel',
              onclick: () => {
                ignoreActive = true;
              },
            },
            {
              label: 'Join',
              onclick: async () => {
                await loadTrial(session.tags?.trialId as string, 'execute');
                setPresetRole(roleID);
                dashboardSvc.switchTo(Dashboards.EXECUTE);
              },
            },
          ],
        }),
        m('.scenario-list', [
          m('.row', [
            m(TextInput, {
              disabled: true,
              label: 'Session status',
              className: 'col s6 m3 l2',
              initialValue: `${
                isConnected
                  ? activeSession
                    ? `${state === TimeState.Started ? 'Running' : 'Loaded'}: ${name}`
                    : 'No active sessions'
                  : 'Not connected'
              }`,
            }),
            m(RoundIconButton, {
              iconName: 'add',
              class: 'green input-field right btn-medium',
              style: 'margin: 1em 1em 0 0;',
              onclick: () => {
                newTrial();
                dashboardSvc.switchTo(Dashboards.TRIAL_INFO);
              },
            }),
            m(TextInput, {
              label: 'Filter',
              id: 'filter',
              iconName: 'filter_list',
              onkeyup: (_: KeyboardEvent, v?: string) => (filterValue = v),
              style: 'margin-right:100px',
              className: 'right',
            }),
          ]),
          m(
            '.row.sb.large',
            filteredTrials.map((trial) =>
              m('.col.s6.m4.l3', [
                m(
                  '.card',
                  m('.card-content', { style: 'height: 150px' }, [
                    m(
                      'a[href=#].card-title',
                      {
                        onclick: async () => {
                          await loadTrial(trial.id);
                          dashboardSvc.switchTo(Dashboards.TRIAL_INFO);
                        },
                      },
                      `${trial.title || 'Untitled'}${trial.lastEdit ? ` (${formatDate(trial.lastEdit)})` : ''}`
                    ),
                    m(
                      'p',
                      trial.description && trial.description.length > 120
                        ? `${trial.description.substr(0, 119)}...`
                        : trial.description
                    ),
                  ]),
                  m('.card-action', [
                    m(
                      'a',
                      {
                        href: `${apiService}/repo/${trial.id}`,
                      },
                      m(Icon, {
                        iconName: 'cloud_download',
                      })
                    ),
                    m(
                      'a',
                      {
                        href: '#!',
                        onclick: () => {
                          m.request<ITrialOverview>({
                            method: 'POST',
                            url: `${apiService}/repo/clone/${trial.id}`,
                          }).then(async (to) => {
                            if (to && to.id) {
                              await loadTrial(to.id);
                              dashboardSvc.switchTo(Dashboards.TRIAL_INFO);
                            }
                          });
                        },
                      },
                      m(Icon, {
                        iconName: 'content_copy',
                      })
                    ),
                    ((session &&
                      (session.state === SessionState.Closed ||
                        session.state === SessionState.Stopped ||
                        (isConnected && !session.state))) ||
                      trialId === trial.id) &&
                      m(
                        'a',
                        {
                          href: '#!',
                          onclick: async () => {
                            await loadTrial(trial.id, 'execute');
                            dashboardSvc.switchTo(Dashboards.EXECUTE);
                          },
                        },
                        m(Icon, {
                          iconName: 'directions_run',
                        })
                      ),
                  ])
                ),
              ])
            )
          ),
        ]),
      ];
    },
  };
};
