import m, { FactoryComponent } from 'mithril';
import { deepCopy } from 'trial-manager-models';
import { executingChannel, TopicNames, IExecutingInject } from '../../models';
import { Icon } from 'mithril-materialized';
import { getMessageIcon, getMessageTitle } from '../../utils';
import { ExecutingMessageView } from './executing-message-view';

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

      return m('.injects-form', [
        m(
          '.row',
          m(
            '. col.s12',
            inject
              ? [
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
