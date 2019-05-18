import m from 'mithril';
import { InjectsList } from './injects-list';
import { InjectsForm } from './injects-form';
import { InjectsTimeline } from './injects-timeline';

export const InjectsView = () => {
  return {
    view: () =>
      m('.row.sb.large', [
        m('.col.s12.m5.l4', m(InjectsList)),
        m(
          '.col.s12.m7.l8',
          m('.row', [
            m(
              '.col.s12',
              m(
                'ul.tabs',
                {
                  style: 'margin-top: 10px;', // to align with the filter
                  // https://github.com/Dogfalo/materialize/issues/4159 when swipeable is true
                  oncreate: ({ dom }) => M.Tabs.init(dom, { swipeable: false }),
                },
                [
                  m('li.tab.col.s3', m('a[href="#timeline"]', 'Timeline')),
                  m('li.tab.col.s3', m('a[href="#message"]', 'Message')),
                ]
              )
            ),
            m('.col.s12[id=message]', m(InjectsForm)),
            m('.col.s12[id=timeline]', m(InjectsTimeline)),
          ])
        ),
      ]),
  };
};
