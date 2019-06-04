import m from 'mithril';
import { Tabs } from 'mithril-materialized';
import { InjectsList } from './injects-list';
import { InjectsForm } from './injects-form';
import { InjectsTimeline } from './injects-timeline';

export const InjectsView = () => {
  const state = {
    selectedTabId: 'timeline',
  } as {
    selectedTabId: string;
  };

  return {
    view: () => {
      return m('.row.sb.large', [
        m('.col.s12.m5.l4', m(InjectsList)),
        m(
          '.col.s12.m7.l8.timeline-message',
          m(Tabs, {
            tabWidth: 'fixed',
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
