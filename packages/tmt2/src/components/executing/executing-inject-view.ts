import m from 'mithril';
import { InjectType } from '../../../../models';
import { Icon } from 'mithril-materialized';
import { getMessageIcon, getMessageTitle, getInjectIcon, getInject } from '../../utils';
import { ManualTransition } from './manual-transition';
import { MessageForm } from '../messages/message-form';
import { MeiosisComponent } from '../../services';
import { ExecutingMessageView } from './executing-message-view';

export const ExecutingInjectView: MeiosisComponent = () => {
  let editing = false;

  return {
    view: ({ attrs: { state, actions } }) => {
      const { scenarioId, injectId, trial } = state.exe;
      const inject = getInject(trial, injectId || scenarioId);
      console.log('inject', inject);
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
                  m(MessageForm, { state, actions }),
                ]
              : inject && [
                  m(ManualTransition, { state, actions, options: { editing: (b) => (editing = b) } }), // TODO can set editing to true
                  m('h4', [
                    m(Icon, {
                      iconName: getMessageIcon(inject.messageType),
                      style: 'margin-right: 12px;',
                    }),
                    getMessageTitle(inject.messageType),
                  ]),
                  editing ? m(MessageForm, { state, actions }) : m(ExecutingMessageView, { state, actions }),
                ]
          )
        ),
      ]);
    },
  };
};
