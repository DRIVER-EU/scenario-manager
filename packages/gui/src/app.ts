import 'materialize-css/js/jquery.hammer';
import 'materialize-css/js/hammer.min';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import './styles.css';
import m, { RouteDefs, Vnode } from 'mithril';
import { Layout } from './components/layout';
import { UserForm } from './components/user-form';
import { ScenarioList } from './components/scenario-list';

export const M: { updateTextFields: () => void } = (window as any).Materialize;

const routingTable: RouteDefs = {
  '/scenario': {
    render: (vnode: Vnode<{ id: number; editing: boolean }>) =>
      m(Layout, m(UserForm, { ...vnode.attrs, editing: false })),
  },
  '/scenario/:id': {
    render: (vnode: Vnode<{ id: number; editing: boolean }>) =>
      m(Layout, m(UserForm, { ...vnode.attrs, editing: true })),
  },
  '/': {
    render: () => m(Layout, m(ScenarioList)),
  },
};

m.route(document.body, '/', routingTable);
