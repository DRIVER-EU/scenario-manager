import m, { FactoryComponent } from 'mithril';
import { deepCopy, InjectType } from 'trial-manager-models';
import { executingChannel, TopicNames, IExecutingInject } from '../../models';
import { Icon } from 'mithril-materialized';
import { getMessageIcon, getMessageTitle, getInjectIcon } from '../../utils';
import { ExecutingMessageView } from './executing-message-view';
import { ManualTransition } from './manual-transition';
import { MessageForm } from '../messages/message-form';

export const ExecutingInjectView: FactoryComponent = () => {
  const state = {
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
      const { inject } = state;
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
                    m('h4', [
                      m(Icon, {
                        iconName: getInjectIcon(inject.type),
                        style: 'margin-right: 12px;',
                      }),
                      inject.title,
                    ]),
                    m(MessageForm, { inject, disabled: true }),
                  ]
                : [
                    m(ManualTransition, { inject, key: inject.id }),
                    m('h4', [
                      m(Icon, {
                        iconName: getMessageIcon(inject.messageType),
                        style: 'margin-right: 12px;',
                      }),
                      getMessageTitle(inject.messageType),
                    ]),
                    m(ExecutingMessageView, { inject }),
                  ]
              : undefined
          )
        ),
      ]);
    },
  };
};
