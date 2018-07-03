import { AppState } from './../models/app-state';
import m, { Vnode } from 'mithril';
import owl from '../assets/owl.svg';

const isActive = (path: string) => (m.route.get().indexOf(path) >= 0 ? '.active' : '');

export const Layout = () => ({
  view: (vnode: Vnode) =>
    m('container', [
      m(
        'nav',
        m('.nav-wrapper', [
          m(
            'a.brand-logo',
            { style: 'margin-left: 20px' },
            m(`img[width=45][height=45][src=${owl}]`, { style: 'margin-top: 10px; margin-left: -10px;' })
          ),
          m(
            'ul.right',
            AppState.dashboards
              .filter((d) => d.visible())
              .map((d) =>
                m(`li${isActive(d.route())}`, m(`a[href="${d.route()}"]`, { oncreate: m.route.link }, d.title))
              )
          ),
        ])
      ),
      m('section.main', vnode.children),
    ]),
});
