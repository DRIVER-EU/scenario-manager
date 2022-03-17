import m from 'mithril';
import { SessionControl } from './session-control';
import { InjectsForm } from '../injects/injects-form';
import { dashboardSvc, MeiosisComponent } from '../../services';
import { getActiveTrialInfo } from '../../utils';
import { ModalPanel, Select } from 'mithril-materialized';
import { UserRole } from 'trial-manager-models';
import { Dashboards } from '../../models';

let roleID: string;
let loggedIn: boolean;

export const SessionView: MeiosisComponent = () => {
  let mdl: M.Modal;

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
    onupdate: () => {
      if ((!mdl || !mdl.isOpen) && !loggedIn) {
        mdl.open();
      }
    },
    view: ({ attrs: { state, actions } }) => {
      const options = { editing: false };
      loggedIn = state.exe.userId ? true : false;

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

      return [
        m(ModalPanel, {
          className: 'show',
          options: { opacity: 0.7 },
          //fixedFooter: true,
          onCreate: (modal) => {
            modal.options.endingTop = '5%';
            mdl = modal;
          },
          id: 'session-start',
          title: 'Role selection',
          description: m('div', [
            m(Select, {
              placeholder: 'Pick a role',
              className: 'inline large',
              options: selOpts ? selOpts : [],
              onchange: (v) => {
                roleID = v[0] as string;
              },
            }),
            m('div', { style: 'margin-bottom: 150px' }),
          ]),
          buttons: [
            {
              label: 'Cancel',
              onclick: async () => {
                dashboardSvc.switchTo(Dashboards.HOME);
              },
            },
            {
              label: 'Start',
              onclick: async () => {
                actions.loginUser(roleID);
                loggedIn = true;
              },
            },
          ],
        }),
        m('.row.sb.large', [
          m('.col.s12.m4', m(SessionControl, { state, actions, options })),
          m('.col.s12.m8', m(InjectsForm, { state, actions, options })),
        ]),
      ];
    },
  };
};
