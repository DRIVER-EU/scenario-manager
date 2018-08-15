import 'materialize-css/js/jquery.hammer';
import 'materialize-css/js/hammer.min';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import './styles.css';
import m from 'mithril';
import { dashboardSvc } from './services/dashboard-service';

export const M: { updateTextFields: () => void } = (window as any).Materialize;

m.route(document.body, dashboardSvc.defaultRoute, dashboardSvc.routingTable);
