import 'materialize-css/js/jquery.hammer';
import 'materialize-css/js/hammer.min';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import './styles.css';
import m, { RouteDefs } from 'mithril';
import { Layout } from './components/layout';
import { ScenarioList } from './components/scenario-list';
import { ScenarioForm } from './components/scenario-form';
import { ObjectivesView } from './components/objective-view';

export const M: { updateTextFields: () => void } = (window as any).Materialize;

const routingTable: RouteDefs = {
  '/objectives': {
    render: () => m(Layout, m(ObjectivesView)),
  },
  '/scenario': {
    render: () =>
      m(Layout, m(ScenarioForm)),
  },
  '/home': {
    render: () => m(Layout, m(ScenarioList)),
  },
};

m.route(document.body, '/home', routingTable);
