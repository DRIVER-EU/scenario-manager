import m, { RouteDefs, ComponentTypes } from 'mithril';
import { IDashboard } from '../models/dashboard';
import { ISubscriptionDefinition } from './message-bus-service';
import { TopicNames, scenarioChannel } from '../models/channels';
import { ObjectivesView } from '../components/objectives/objective-view';
import { ScenarioForm } from '../components/scenario/scenario-form';
import { ScenarioList } from '../components/scenario/scenario-list';
import { Layout } from '../components/layout';
import { InjectsView } from '../components/injects/injects-view';
import { Dashboards } from '../models/dashboards';
import { UsersView } from '../components/users/users-list';
import { StakeholdersView } from '../components/stakeholders/stakeholders-list';

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
    this.subscription = scenarioChannel.subscribe(TopicNames.ITEM_UPDATE, ({ cur }) => {
      if (cur) {
        this.setList(
          this.dashboards.map(d => {
            d.visible = d.id !== Dashboards.NEW_SCENARIO;
            return d;
          })
        );
        this.switchTo(Dashboards.SCENARIO);
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
    component: ScenarioList,
  },
  {
    id: Dashboards.SCENARIO,
    title: 'Edit',
    route: '/edit',
    visible: false,
    component: ScenarioForm,
  },
  {
    id: Dashboards.SCENARIO_INFO,
    title: 'Info',
    route: '/edit/info',
    visible: false,
    component: ScenarioForm,
    level: Dashboards.SCENARIO,
  },
  {
    id: Dashboards.USERS,
    title: 'Users',
    route: '/edit/users',
    visible: false,
    component: UsersView,
    level: Dashboards.SCENARIO,
  },
  {
    id: Dashboards.STAKEHOLDERS,
    title: 'Stakeholders',
    route: '/edit/stakeholders',
    visible: false,
    component: StakeholdersView,
    level: Dashboards.SCENARIO,
  },
  {
    id: Dashboards.OBJECTIVES,
    title: 'Objectives',
    route: '/edit/objectives',
    visible: false,
    component: ObjectivesView,
    level: Dashboards.SCENARIO,
  },
  {
    id: Dashboards.OBJECTIVES,
    title: 'Storylines',
    route: '/edit/storylines',
    visible: false,
    component: InjectsView,
    level: Dashboards.SCENARIO,
  },
]);
