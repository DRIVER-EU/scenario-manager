import m from 'mithril';
import { InjectType } from '../../../../models';
import { Icon } from 'mithril-materialized';
import { getMessageIcon, getMessageTitle, getInjectIcon, getInject } from '../../utils';
import { ExecutingMessageView } from './executing-message-view';
import { ManualTransition } from './manual-transition';
import { MessageForm } from '../messages/message-form';
import { MeiosisComponent } from '../../services';

export const ExecutingInjectView: MeiosisComponent = () => {
  let editing = false;

  // const state = {
  //   editing: false,
  //   inject: undefined as IExecutingInject | undefined,
  // };

  return {
    view: ({ attrs: { state, actions } }) => {
      const { injectId, trial } = state.app;
      const inject = getInject(trial, injectId);
      if (!inject) return;
      const isGroupInject = inject && inject.type !== InjectType.INJECT;

      return m('.injects-form', [
        m(
          '.row',
          m(
            '.col.s12',
            inject
              ? isGroupInject
                ? [
                    m(ManualTransition, { state, actions, options: { editing: (b) => (editing = b) } }),
                    m('h4', { key: -1 }, [
                      m(Icon, {
                        iconName: getInjectIcon(inject.type),
                        style: 'margin-right: 12px;',
                      }),
                      inject.title,
                    ]),
                    m(MessageForm, { state, actions }),
                  ]
                : [
                    m(ManualTransition, { state, actions, options: { editing: (b) => (editing = b) } }), // TODO can set editing to true
                    m('h4', { key: -1 }, [
                      m(Icon, {
                        iconName: getMessageIcon(inject.messageType),
                        style: 'margin-right: 12px;',
                      }),
                      getMessageTitle(inject.messageType),
                    ]),
                    editing ? m(MessageForm, { state, actions }) : m(ExecutingMessageView, { state, actions }),
                  ]
              : undefined
          )
        ),
      ]);
    },
  };
};
