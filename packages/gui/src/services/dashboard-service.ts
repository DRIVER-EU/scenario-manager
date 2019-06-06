import m, { RouteDefs, ComponentTypes } from 'mithril';
import { IDashboard } from '../models/dashboard';
import { ISubscriptionDefinition } from './message-bus-service';
import { TopicNames, scenarioChannel as trialChannel } from '../models/channels';
import { ObjectivesView } from '../components/objectives/objective-view';
import { TrialForm } from '../components/trials/trial-form';
import { TrialList } from '../components/trials/trial-list';
import { Layout } from '../components/layout';
import { InjectsView } from '../components/injects/injects-view';
import { Dashboards } from '../models/dashboards';
import { UsersView } from '../components/users/users-list';
import { StakeholdersView } from '../components/stakeholders/stakeholders-list';
import { AssetsView } from '../components/assets';
import { SessionState } from '../components/session/session-state';
import { TrialSettings } from '../components/configuration/trial-settings';
import { SimulationView } from '../components/simulation';
import { SessionView } from '../components/session/session-view';
import { OverviewMap } from '../components/map/overview-map';

class DashboardService {
  private subscription!: ISubscriptionDefinition<any>;
  private dashboards!: ReadonlyArray<IDashboard>;

  constructor(private layout: ComponentTypes, dashboards: IDashboard[]) {
    this.setList(dashboards);
    this.subscribe();
  }

  public getList(level?: string) {
    return this.dashboards.filter(d => d.level === level);
  }

  public setList(list: IDashboard[]) {
    this.dashboards = Object.freeze(list);
  }

  public getCurrent(route: string) {
    return this.dashboards.filter(d => route.indexOf(d.route) >= 0).shift();
  }

  public get defaultRoute() {
    const dashboard = this.dashboards.filter(d => d.default).shift();
    return dashboard ? dashboard.route : this.dashboards[0].route;
  }

  public get routingTable() {
    return this.dashboards.reduce(
      (p, c) => {
        p[c.route] = { render: () => m(this.layout, m(c.component)) };
        return p;
      },
      {} as RouteDefs
    );
  }

  public switchTo(dashboardId: Dashboards) {
    const dashboard = this.dashboards.filter(d => d.id === dashboardId).shift();
    if (dashboard) {
      m.route.set(dashboard.route);
    }
  }

  private subscribe() {
    this.subscription = trialChannel.subscribe(TopicNames.ITEM_UPDATE, ({ cur }) => {
      if (cur) {
        this.setList(
          this.dashboards.map(d => {
            d.visible = true;
            return d;
          })
        );
        this.switchTo(Dashboards.TRIAL);
      } else {
        this.setList(
          this.dashboards.map(d => {
            d.visible = d.id === Dashboards.HOME;
            return d;
          })
        );
        this.switchTo(Dashboards.HOME);
      }
    });
  }
}

export const dashboardSvc: DashboardService = new DashboardService(Layout, [
  {
    id: Dashboards.HOME,
    default: true,
    title: 'Home',
    route: '/home',
    visible: true,
    component: TrialList,
  },
  {
    id: Dashboards.TRIAL,
    title: 'Edit',
    route: '/edit/scenarios',
    visible: false,
    component: InjectsView,
  },
  {
    id: Dashboards.EXECUTE,
    title: 'Run',
    route: '/execute/session',
    visible: false,
    component: SessionView,
  },
  {
    id: Dashboards.SETTINGS,
    title: 'Settings',
    iconName: 'settings',
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
  {
    id: Dashboards.TRIAL_SETTINGS,
    title: 'Topics',
    route: '/settings/topics',
    visible: false,
    component: TrialSettings,
    level: Dashboards.SETTINGS,
  },
  {
    id: Dashboards.ASSETS,
    title: 'Assets',
    route: '/settings/assets',
    visible: false,
    component: AssetsView,
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
  {
    id: Dashboards.SIMULATION,
    title: 'simulation',
    route: '/edit/simulation',
    visible: false,
    component: SimulationView,
    level: Dashboards.TRIAL,
  },
  {
    id: Dashboards.SESSIONS,
    title: 'Sessions',
    route: '/execute/session',
    visible: false,
    level: Dashboards.EXECUTE,
    component: SessionView,
  },
  {
    id: Dashboards.SESSION_STATE,
    title: 'Status',
    route: '/execute/state',
    visible: false,
    level: Dashboards.EXECUTE,
    component: SessionState,
  },
]);
