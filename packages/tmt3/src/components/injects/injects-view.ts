import m from 'mithril';
import { Tabs } from 'mithril-materialized';
import { InjectsList } from './injects-list';
import { InjectsForm } from './injects-form';
import { InjectsTimeline } from './injects-timeline';
import { MeiosisComponent } from '../../services';

export const InjectsView: MeiosisComponent = () => {
  let selectedTabId = 'message' as 'timeline' | 'message';

  return {
    view: ({ attrs: { state, actions } }) => {
      const { trial } = state.app;
      return m('.row', [
        m('.col.s12.m5.l4', m(InjectsList, { state, actions })),
        !trial.injects || trial.injects.length === 0
          ? m('.row', m('.col.s12', m('i', 'No scenario found. Please create one using the + button.')))
          : m(
              '.col.s12.m7.l8.timeline-message',
              m(Tabs, {
                tabWidth: 'fixed',
                selectedTabId,
                // onShow: (newContent) => (selectedTabId = newContent.id === 'timeline' ? 'timeline' : 'message'),
                tabs: [
                  {
                    id: 'message',
                    title: 'Message',
                    // contentClass: 'sb large',
                    vnode: m(InjectsForm, { state, actions, options: { editing: true } }),
                  },
                  {
                    id: 'timeline',
                    title: 'Timeline',
                    vnode: m(InjectsTimeline, { state, actions }),
                  },
                ],
              })
            ),
      ]);
    },
  };
};
