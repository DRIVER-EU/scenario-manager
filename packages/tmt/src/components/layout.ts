import m, { FactoryComponent } from 'mithril';
import owl from '../assets/owl.svg';
import { dashboardSvc, SocketSvc, TrialSvc } from '../services';
import { Dashboards } from '../models/dashboards';
import { StatusBar } from './status/status-bar';
import { Icon } from 'mithril-materialized';
import { MediaControls } from './session/time-control';
import { AppState, IDashboard } from '../models';
import { TimeState, SessionState } from '../../../models';

export const Layout: FactoryComponent<{}> = () => {
  const MenuItem: FactoryComponent<IDashboard> = () => {
    return {
      view: ({ attrs: d }) =>
        m(
          m.route.Link,
          { href: d.route },
          d.iconName ? m(Icon, { iconName: d.iconName, class: d.iconClass }) : d.title
        ),
    };
  };

  return {
    view: vnode => {
      const curRoute = m.route.get();
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
      const time = AppState.time;
      const trial = TrialSvc.getCurrent();
      const trialTitle = trial && trial.title ? trial.title.toUpperCase() : 'BOOBOOK';
      const isRunning = AppState.session && AppState.session.state === SessionState.Started;
      const title =
        executeMode && isRunning && AppState.session.name && AppState.session.tags && AppState.session.tags.sessionName
          ? `${AppState.session.tags.trialName} - ${AppState.session.tags.sessionName.toLowerCase()}`
          : trialTitle;

      return m('container', [
        m('nav', { class: hasSubDashboards ? 'nav-extended' : '' }, [
          m('.nav-wrapper', [
            m('a.brand-logo', { style: 'margin-left: 20px' }, [
              m(`img[width=32][height=32][src=${owl}]`, { style: 'margin: 5px 10px 0 -5px;' }),
              m('span.black-text', { style: 'vertical-align: top;' }, title),
            ]),
            m(
              'ul.right',
              dashboardSvc
                .getList()
                .filter(d => d.visible)
                .map(d => m(`li${isActive(mainPath(d.route))}`, m(MenuItem, d)))
            ),
          ]),
          hasSubDashboards
            ? m(
                '.nav-content',
                m('ul.tabs.tabs-transparent', [
                  ...subDashboards.map(d => m(`li.tab${isActive(d.route)}`, m(MenuItem, d))),
                  executeMode && time.state !== TimeState.Reset
                    ? m(MediaControls, {
                        id: 'layout-controls',
                        className: 'right',
                        socket: SocketSvc.socket,
                        realtime: false,
                        isPaused: time.state === TimeState.Paused,
                        canChangeSpeed: true,
                        canStop: false,
                        time: AppState.time,
                      })
                    : undefined,
                ])
              )
            : undefined,
        ]),
        m('section.main[id=main]', vnode.children),
        // m('section.main', { style: 'height: 80vh; overflow-y: auto;' }, vnode.children),
        executeMode ? m(StatusBar) : undefined,
      ]);
    },
  };
};
