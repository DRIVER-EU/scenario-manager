import m, { RouteDefs, ComponentTypes } from 'mithril';
import { IDashboard } from '../models/dashboard';
import { messageBus, ISubscriptionDefinition } from './message-bus-service';
import { IScenario } from '../models/scenario';
import { ChannelNames, TopicNames, scenarioChannel } from '../models/channels';
import { ObjectivesView } from '../components/objective-view';
import { ScenarioForm } from '../components/scenario-form';
import { ScenarioList } from '../components/scenario-list';
import { Layout } from '../components/layout';

export const enum Dashboards {
  HOME = 'HOME',
  NEW_SCENARIO = 'NEW_SCENARIO',
  SCENARIO = 'SCENARIO',
  OBJECTIVES = 'OBJECTIVES',
}

class DashboardService {
  private subscription!: ISubscriptionDefinition<any>;
  private dashboards!: ReadonlyArray<IDashboard>;

  constructor(private layout: ComponentTypes, dashboards: IDashboard[]) {
    this.setList(dashboards);
    this.subscribe();
  }

  public getList() {
    return this.dashboards;
  }

  public setList(list: IDashboard[]) {
    this.dashboards = Object.freeze(list);
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
    title: 'Scenario',
    route: '/scenario', // `/scenario/${ScenarioSvc.current.id}`,
    visible: false,
    component: ScenarioForm,
  },
  {
    id: Dashboards.OBJECTIVES,
    title: 'Objectives',
    route: '/objectives',
    visible: false,
    component: ObjectivesView,
  },
]);
