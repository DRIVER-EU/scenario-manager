import m, { FactoryComponent } from 'mithril';
import owl from '../assets/owl.svg';
import { dashboardSvc, MeiosisComponent } from '../services';
import { Dashboards } from '../models/dashboards';
// import { StatusBar } from './status/status-bar';
import { Icon } from 'mithril-materialized';
// import { MediaControls } from './session/time-control';
import { IDashboard } from '../models';
import { SessionState } from '../../../models';

export const Layout: MeiosisComponent = () => {
  const MenuItem: FactoryComponent<IDashboard> = () => {
    return {
      view: ({ attrs: d }) =>
        m(
          m.route.Link,
          { href: d.route },
          d.icon
            ? m(Icon, {
                iconName: typeof d.icon === 'string' ? d.icon : d.icon(),
                class: d.iconClass,
              })
            : typeof d.title === 'string'
            ? d.title
            : d.title()
        ),
    };
  };

  return {
    view: ({
      children,
      attrs,
      // attrs: {
      //   state: {
      //     app: { trial, session },
      //   },
      //   // actions: { changePage },
      // },
    }) => {
      if (!attrs || !attrs.state || !attrs.state.app) return;
      const { trial, session } = attrs.state.app;
      const curRoute = m.route.get();
      if (!trial.id && curRoute !== dashboardSvc.defaultRoute) {
        return dashboardSvc.switchTo(Dashboards.HOME);
      }
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
      const trialTitle = trial && trial.title ? trial.title.toUpperCase() : 'BOOBOOK';
      const isRunning = session && session.state === SessionState.Started;
      const title =
        executeMode && isRunning && session.name && session.tags && session.tags.sessionName
          ? `${session.tags.trialName} - ${session.tags.sessionName.toLowerCase()}`
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
                .filter((d) => d.visible || (trial.id && !d.level))
                .map((d) => m(`li${isActive(mainPath(d.route))}`, m(MenuItem, d)))
            ),
          ]),
          hasSubDashboards
            ? m(
                '.nav-content',
                m('ul.tabs.tabs-transparent', [
                  ...subDashboards.map((d) => m(`li.tab${isActive(d.route)}`, m(MenuItem, d))),
                  // executeMode && time && time.state !== TimeState.Reset
                  //   ? m(MediaControls, {
                  //       id: 'layout-controls',
                  //       className: 'right',
                  //       socket: SocketSvc.socket,
                  //       realtime: false,
                  //       isPaused: time.state === TimeState.Paused,
                  //       canChangeSpeed: true,
                  //       canStop: false,
                  //       time,
                  //     })
                  //   : undefined,
                ])
              )
            : undefined,
        ]),
        m('section.main[id=main]', children),
        // m('section.main', { style: 'height: 80vh; overflow-y: auto;' }, vnode.children),
        // executeMode ? m(StatusBar) : undefined,
      ]);
    },
  };
};
