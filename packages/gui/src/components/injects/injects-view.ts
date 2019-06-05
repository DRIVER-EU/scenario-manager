import m from 'mithril';
import { Tabs } from 'mithril-materialized';
import { InjectsList } from './injects-list';
import { InjectsForm } from './injects-form';
import { InjectsTimeline } from './injects-timeline';
import { injectsChannel, TopicNames } from '../../models';
import { isInjectGroup } from '../../utils';

export const InjectsView = () => {
  const state = {
    selectedTabId: 'timeline' as 'timeline' | 'message',
    subscription: injectsChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
      console.warn(cur);
      if (!isInjectGroup(cur)) {
        state.selectedTabId = 'message';
      }
    }),
  };

  return {
    onremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { selectedTabId } = state;
      return m('.row.sb.large', [
        m('.col.s12.m5.l4', m(InjectsList)),
        m(
          '.col.s12.m7.l8.timeline-message',
          m(Tabs, {
            tabWidth: 'fixed',
            selectedTabId,
            onShow: newContent => state.selectedTabId = newContent.id === 'timeline' ? 'timeline' : 'message',
            tabs: [
              {
                id: 'timeline',
                title: 'Timeline',
                vnode: m(InjectsTimeline),
              },
              {
                id: 'message',
                title: 'Message',
                // contentClass: 'sb large',
                vnode: m(InjectsForm),
              },
            ],
          })
        ),
      ]);
    },
  };
};
