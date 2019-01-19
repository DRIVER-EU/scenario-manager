import 'materialize-css/dist/css/materialize.min.css';
import 'material-icons/iconfont/material-icons.css';
import './styles.css';
import m from 'mithril';
import { dashboardSvc } from './services';

m.route(document.body, dashboardSvc.defaultRoute, dashboardSvc.routingTable);

declare var module: any;

if (module.hot) {
  module.hot.accept();
}
