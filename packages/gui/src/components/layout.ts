import m, { Vnode } from 'mithril';

export const Layout = () => ({
  view: (vnode: Vnode) =>
    m('container', [
      m('nav',
        m('.nav-wrapper', [
          m('a.brand-logo', { style: 'margin-left: 20px'}, 'Logo'),
          m('ul.right', [
            m('li',
              m('a[href="/list"]',
                {
                  oncreate: m.route.link,
                },
                'Users'
              )
            ),
          ]),
        ])
      ),
      m('section', vnode.children),
    ]),
});
