import m, { FactoryComponent } from 'mithril';
import owl from '../assets/owl.svg';
import { dashboardSvc } from '../services';
import { Dashboards } from '../models/dashboards';
import { StatusBar } from './status/status-bar';
import { Icon } from 'mithril-materialized';

export const Layout: FactoryComponent<{}> = () => {
  return {
    view: vnode => {
      const curRoute = m.route.get();
      console.log(curRoute);
      const mainPath = (path: string) => {
        const subs = path.split('/');
        if (subs.length > 2) {
          subs.pop();
        }
        return subs.join('/');
      };
      const isActive = (path: string) => (curRoute.indexOf(path) >= 0 ? '.active' : '');
      const curDashboard = dashboardSvc.getCurrent(curRoute);
      const subDashboards = curDashboard ? dashboardSvc.getList(curDashboard.level || curDashboard.id) : [];
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
              m(`img[width=32][height=32][src=${owl}]`, { style: 'margin-top: 5px; margin-left: -5px;' })
            ),
            m(
              'ul.right',
              dashboardSvc
                .getList()
                .filter(d => d.visible)
                .map(d =>
                  m(
                    `li${isActive(mainPath(d.route))}`,
                    m(
                      'a',
                      { href: d.route, oncreate: m.route.link },
                      d.iconName ? m(Icon, { iconName: d.iconName }) : d.title
                    )
                  )
                )
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
        // m('section.main', { style: 'height: 80vh; overflow-y: auto;' }, vnode.children),
        executeMode ? m(StatusBar) : undefined,
      ]);
    },
  };
};
