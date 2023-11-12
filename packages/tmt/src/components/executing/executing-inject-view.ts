import m from 'mithril';
import { InjectType } from 'trial-manager-models';
import { Icon } from 'mithril-materialized';
import { getMessageIconFromTemplate, getInjectIcon, getInject, getMessageTitleFromTemplate } from '../../utils';
import { ManualTransition } from './manual-transition';
import { MessageForm } from '../messages/message-form';
import { MeiosisComponent } from '../../services';
import { ExecutingMessageView } from './executing-message-view';

export const ExecutingInjectView: MeiosisComponent = () => {
  let editing = false;
  let getMessageIcon: (topic?: string) => string;
  let getMessageTitle: (topic?: string) => string;

  return {
    oninit: ({
      attrs: {
        state: {
          app: { templates },
        },
      },
    }) => {
      getMessageIcon = getMessageIconFromTemplate(templates);
      getMessageTitle = getMessageTitleFromTemplate(templates);
    },
    view: ({ attrs: { state, actions } }) => {
      const { scenarioId, injectId, trial } = state.exe;
      const inject = getInject(trial, injectId || scenarioId);
      if (!inject) return;
      const isGroupInject = inject && inject.type !== InjectType.INJECT;

      return m('.injects-form', [
        m(
          '.row',
          m(
            '.col.s12',
            isGroupInject
              ? [
                m(ManualTransition, { state, actions, options: { editing: (b) => (editing = b) } }),
                m('h4', [
                  m(Icon, {
                    iconName: getInjectIcon(inject.type),
                    style: 'margin-right: 12px;',
                  }),
                  inject.title,
                ]),
                m(MessageForm, { state, actions, options: { editing } }),
              ]
              : inject && [
                m(ManualTransition, { state, actions, options: { editing: (b) => (editing = b) } }), // TODO can set editing to true
                m('h4', [
                  m(Icon, {
                    iconName: getMessageIcon(inject.templateId),
                    style: 'margin-right: 12px;',
                  }),
                  getMessageTitle(inject.templateId),
                ]),
                editing
                  ? m(MessageForm, { state, actions, options: { editing } })
                  : m(ExecutingMessageView, { state, actions, options: { editing } }),
              ]
          )
        ),
      ]);
    },
  };
};
