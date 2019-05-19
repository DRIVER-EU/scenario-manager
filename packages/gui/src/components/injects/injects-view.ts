import m from 'mithril';
import { InjectsList } from './injects-list';
import { InjectsForm } from './injects-form';
import { InjectsTimeline } from './injects-timeline';
import { injectsChannel, TopicNames } from '../../models';

export const InjectsView = () => {
  const state = {
    msgTabActive: false,
    subscription: injectsChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
      state.msgTabActive = true;
      m.redraw();
    }),
  };

  const initTabs = (dom: Element) => {
    // https://github.com/Dogfalo/materialize/issues/4159 when swipeable is true
    M.Tabs.init(dom, {
      onShow: () => (state.msgTabActive = false),
      swipeable: false,
    });
  };

  return {
    onremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { msgTabActive } = state;
      return m('.row.sb.large', [
        m('.col.s12.m5.l4', m(InjectsList)),
        m(
          '.col.s12.m7.l8',
          m('.row', [
            m(
              '.col.s12',
              m(
                'ul.tabs',
                {
                  style: 'margin-top: 12px;', // to align with the filter
                  oncreate: ({ dom }) => initTabs(dom),
                },
                [
                  m('li.tab.col.s3', m('a[href="#timeline"]', { className: msgTabActive ? '' : 'active' }, 'Timeline')),
                  m('li.tab.col.s3', m('a[href="#message"]', { className: msgTabActive ? 'active' : '' }, 'Message')),
                ]
              )
            ),
            m('.col.s12[id=timeline]', m(InjectsTimeline)),
            m('.col.s12[id=message]', m(InjectsForm)),
          ])
        ),
      ]);
    },
  };
};
