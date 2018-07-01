import m, { Vnode } from 'mithril';

export const Layout = () => ({
  view: (vnode: Vnode) =>
    m('container', [
      m(
        'nav',
        m('.nav-wrapper', [
          m('a.brand-logo', { style: 'margin-left: 20px' }, 'Logo'),
          m('ul.right', [
            m(
              `li${m.route.get() === '/' ? '.active' : ''}`,
              m(
                'a[href="/"]',
                {
                  oncreate: m.route.link,
                },
                'Home'
              )
            ),
          ]),
        ])
      ),
      m('section.main', vnode.children),
    ]),
});
