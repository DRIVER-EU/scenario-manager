import 'material-icons/iconfont/material-icons.css';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min.js';
import m from 'mithril';
import './css/styles.css';
import { dashboardSvc } from './services/dashboard-service';
import L from 'leaflet';
import { registerPlugin } from 'mithril-ui-form';
import { modalPlugin } from './components/ui';

declare var require: any;

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

registerPlugin('modal', modalPlugin);
m.route.prefix = '/tmt/#!';
m.route(document.body, dashboardSvc.defaultRoute, dashboardSvc.routingTable());
