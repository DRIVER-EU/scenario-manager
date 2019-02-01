import m, { FactoryComponent } from 'mithril';
import owl from '../assets/owl.svg';
import { dashboardSvc } from '../services';
import { Dashboards } from '../models/dashboards';
import { StatusBar } from './status/status-bar';

export const Layout: FactoryComponent<{}> = () => {
  return {
    view: vnode => {
      const curRoute = m.route.get();
      const isActive = (path: string) => (curRoute.indexOf(path) >= 0 ? '.active' : '');
      const curDashboard = dashboardSvc.getCurrent(curRoute);
      const subDashboards = curDashboard ? dashboardSvc.getList(curDashboard.id) : [];
      const hasSubDashboards = subDashboards && subDashboards.length > 0;
      const executeMode = curDashboard
        ? curDashboard.id === Dashboards.EXECUTE || curDashboard.level === Dashboards.EXECUTE
        : false;

      return m('container', [
        m('nav', { class: hasSubDashboards ? 'nav-extended' : '' }, [
          m('.nav-wrapper', [
            m(
              'a.brand-logo',
              { style: 'margin-left: 20px' },
              m(`img[width=45][height=45][src=${owl}]`, { style: 'margin-top: 10px; margin-left: -10px;' })
            ),
            m(
              'ul.right',
              dashboardSvc
                .getList()
                .filter(d => d.visible)
                .map(d => m(`li${isActive(d.route)}`, m('a', { href: d.route, oncreate: m.route.link }, d.title)))
            ),
          ]),
          hasSubDashboards
            ? m(
                '.nav-content',
                m(
                  'ul.tabs.tabs-transparent',
                  subDashboards.map(d =>
                    m(`li.tab${isActive(d.route)}`, m('a', { href: d.route, oncreate: m.route.link }, d.title))
                  )
                )
              )
            : undefined,
        ]),
        m('section.main', vnode.children),
        executeMode ? m(StatusBar) : undefined,
      ]);
    },
  };
};
