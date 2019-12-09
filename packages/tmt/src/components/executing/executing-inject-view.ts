import m, { FactoryComponent } from 'mithril';
import { deepCopy, InjectType, IExecutingInject } from 'trial-manager-models';
import { executingChannel, TopicNames } from '../../models';
import { Icon } from 'mithril-materialized';
import { getMessageIcon, getMessageTitle, getInjectIcon } from '../../utils';
import { ExecutingMessageView } from './executing-message-view';
import { ManualTransition } from './manual-transition';
import { MessageForm } from '../messages/message-form';

export const ExecutingInjectView: FactoryComponent = () => {
  const state = {
    editing: false,
    inject: undefined as IExecutingInject | undefined,
    subscription: executingChannel.subscribe(TopicNames.ITEM_SELECT, ({ cur }) => {
      state.inject = cur ? deepCopy(cur) : undefined;
    }),
  };

  return {
    onremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { inject, editing } = state;
      const isGroupInject = inject && inject.type !== InjectType.INJECT;

      return m('.injects-form', [
        m(
          '.row',
          m(
            '.col.s12',
            inject
              ? isGroupInject
                ? [
                    m(ManualTransition, { inject, key: inject.id }),
                    m('h4', { key: -1 }, [
                      m(Icon, {
                        iconName: getInjectIcon(inject.type),
                        style: 'margin-right: 12px;',
                      }),
                      inject.title,
                    ]),
                    m(MessageForm, { inject, disabled: true, key: inject.id }),
                  ]
                : [
                    m(ManualTransition, { inject, editing: b => (state.editing = b), key: inject.id }),
                    m('h4', { key: -1 }, [
                      m(Icon, {
                        iconName: getMessageIcon(inject.messageType),
                        style: 'margin-right: 12px;',
                      }),
                      getMessageTitle(inject.messageType),
                    ]),
                    editing
                      ? m(MessageForm, { inject, key: inject.id })
                      : m(ExecutingMessageView, { inject, key: inject.id, scope: 'execute' }),
                  ]
              : undefined
          )
        ),
      ]);
    },
  };
};
