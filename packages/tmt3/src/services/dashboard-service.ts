import m, { RouteDefs } from 'mithril';
import { IDashboard, Dashboards } from '../models';
import { actions, states } from './meiosis';
import {
  Layout,
  AssetsView,
  TrialForm,
  TrialList,
  InjectsView,
  ObjectivesView,
  OverviewMap,
  SessionView,
  SessionState,
  StakeholdersView,
  TrialSettings,
  UsersView,
  SessionTable,
  MessageConfigView,
} from '../components';

class DashboardService {
  private dashboards!: ReadonlyArray<IDashboard>;

  constructor(dashboards: IDashboard[]) {
    this.setList(dashboards);
  }

  public getList(level?: string) {
    return this.dashboards.filter((d) => d.level === level);
  }

  public setList(list: IDashboard[]) {
    this.dashboards = Object.freeze(list);
  }

  public getCurrent(route: string) {
    return this.dashboards.filter((d) => route.indexOf(d.route) >= 0).shift();
  }

  public get defaultRoute() {
    const dashboard = this.dashboards.filter((d) => d.default).shift();
    return dashboard ? dashboard.route : this.dashboards[0].route;
  }

  public route(dashboardId: Dashboards) {
    const dashboard = this.dashboards.filter((d) => d.id === dashboardId).shift();
    return dashboard ? dashboard.route : this.defaultRoute;
  }

  public switchTo(
    dashboardId: Dashboards,
    params?: { [key: string]: string | number | undefined },
    query?: { [key: string]: string | number | undefined }
  ) {
    const dashboard = this.dashboards.filter((d) => d.id === dashboardId).shift();
    if (dashboard) {
      const url = dashboard.route + (query ? '?' + m.buildQueryString(query) : '');
      m.route.set(url, params);
    }
  }

  public routingTable() {
    return this.dashboards.reduce((p, c) => {
      p[c.route] =
        c.hasNavBar === false
          ? {
              render: () => m(c.component, { state: states(), actions }),
            }
          : {
              render: () => {
                const state = states();
                return m(Layout, { state, actions }, m(c.component, { state, actions }));
              },
            };
      return p;
    }, {} as RouteDefs);
  }
}

export const dashboardSvc: DashboardService = new DashboardService([
  {
    id: Dashboards.HOME,
    default: true,
    title: 'Home',
    icon: 'home',
    route: '/home',
    visible: true,
    component: TrialList,
  },
  {
    id: Dashboards.TRIAL,
    title: 'Edit',
    icon: 'edit',
    route: '/edit/scenarios',
    visible: false,
    component: InjectsView,
  },
  {
    id: Dashboards.EXECUTE,
    title: 'Run',
    icon: 'directions_run',
    route: '/execute/session',
    visible: false,
    component: SessionView,
  },
  {
    id: Dashboards.SETTINGS,
    title: 'Settings',
    icon: 'settings',
    route: '/settings/users',
    visible: false,
    component: TrialSettings,
  },
  {
    id: Dashboards.TRIAL_INFO,
    title: 'Info',
    route: '/edit/info',
    visible: false,
    component: TrialForm,
    level: Dashboards.TRIAL,
  },
  {
    id: Dashboards.USERS,
    title: 'Users',
    route: '/settings/users',
    visible: false,
    component: UsersView,
    level: Dashboards.SETTINGS,
  },
  /*{
    id: Dashboards.TRIAL_SETTINGS,
    title: 'Topics',
    route: '/settings/topics',
    visible: false,
    component: TrialSettings,
    level: Dashboards.SETTINGS,
  },*/
  {
    id: Dashboards.ASSETS,
    title: 'Assets',
    route: '/settings/assets',
    visible: false,
    component: AssetsView,
    level: Dashboards.SETTINGS,
  },
  /*{
    id: Dashboards.MESSAGES,
    title: 'Messages',
    route: '/settings/messages',
    visible: false,
    component: SelectMessageTypesForm,
    level: Dashboards.SETTINGS,
  },*/
  {
    id: Dashboards.MESSAGE_CONFIG,
    title: 'Message Config',
    route: '/settings/message_config',
    visible: false,
    component: MessageConfigView,
    level: Dashboards.SETTINGS,
  },
  {
    id: Dashboards.STAKEHOLDERS,
    title: 'Stakeholders',
    route: '/edit/stakeholders',
    visible: false,
    component: StakeholdersView,
    level: Dashboards.TRIAL,
  },
  {
    id: Dashboards.OBJECTIVES,
    title: 'Objectives',
    route: '/edit/objectives',
    visible: false,
    component: ObjectivesView,
    level: Dashboards.TRIAL,
  },
  {
    id: Dashboards.SCENARIOS,
    title: 'Scenarios',
    route: '/edit/scenarios',
    visible: false,
    component: InjectsView,
    level: Dashboards.TRIAL,
  },
  {
    id: Dashboards.MAP,
    title: 'Map',
    route: '/edit/map',
    visible: false,
    component: OverviewMap,
    level: Dashboards.TRIAL,
  },
  // {
  //   id: Dashboards.SIMULATION,
  //   title: 'simulation',
  //   route: '/edit/simulation',
  //   visible: false,
  //   component: SimulationView,
  //   level: Dashboards.TRIAL,
  // },
  {
    id: Dashboards.SESSIONS,
    title: 'Session',
    route: '/execute/session',
    visible: false,
    level: Dashboards.EXECUTE,
    component: SessionView,
  },
  {
    id: Dashboards.SESSION_TIMELINE,
    title: 'Timeline',
    icon: 'timelapse',
    route: '/execute/timeline',
    visible: false,
    level: Dashboards.EXECUTE,
    component: SessionState,
  },
  {
    id: Dashboards.SESSION_TABLE,
    title: 'Table',
    icon: 'format_align_justify',
    iconClass: 'flip',
    route: '/execute/table',
    visible: false,
    level: Dashboards.EXECUTE,
    component: SessionTable,
  },
]);
