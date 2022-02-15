import m from 'mithril';
import { SessionControl } from './session-control';
import { InjectsForm } from '../injects/injects-form';
import { dashboardSvc, MeiosisComponent } from '../../services';
import { getActiveTrialInfo } from '../../utils';
import { Button, Select } from 'mithril-materialized';
import { UserRole } from '../../../../models/dist';
import { Dashboards } from '../../models';

let roleID: string;

export const SessionView: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        state,
        actions: { selectInject },
      },
    }) => {
      const { scenario } = getActiveTrialInfo(state);
      scenario && selectInject(scenario);
      m.redraw();
    },
    view: ({ attrs: { state, actions } }) => {
      const options = { editing: false };
      let loggedIn = state.exe.userId ? true : false

      const selOpts =
      state.exe.trial.users &&
      state.exe.trial.users
        .filter(
          (user) =>
            user.roles &&
            user.roles.some((role) => [UserRole.EXCON, UserRole.ROLE_PLAYER, UserRole.VIEWER].indexOf(role) >= 0)
        )
        .map((u) => {
          return { id: u.id, label: u.name };
        });

      return !loggedIn
      ? [
          m('h4', 'Select a role.'),
          m('row', [
            options
              ? m(Select, {
                  placeholder: 'Pick one',
                  className: 'inline large',
                  options: selOpts,
                  onchange: (v) => {
                    roleID = v[0] as string;
                  },
                })
              : undefined,
            m(Button, {
              label: 'Continue',
              onclick: async () => {
                actions.loginUser(roleID);
                loggedIn = true;
              },
            }),
            m(Button, {
              href: '#!',
              label: 'Cancel',
              class: 'red',
              onclick: async () => {
                dashboardSvc.switchTo(Dashboards.HOME);
              },
            }),
          ]),
        ]
      : m('.row.sb.large', [
        m('.col.s12.m4', m(SessionControl, { state, actions, options })),
        m('.col.s12.m8', m(InjectsForm, { state, actions, options })),
      ]);
    },
  };
};
