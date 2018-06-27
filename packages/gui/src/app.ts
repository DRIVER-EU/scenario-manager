import 'materialize-css/js/jquery.hammer';
import 'materialize-css/js/hammer.min';
import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import m, { RouteDefs, Vnode } from 'mithril';
import './styles.css';
import { Layout } from './components/layout';
import { UserForm } from './components/user-form';
import { UserList } from './components/user-list';

export const M: { updateTextFields: () => void } = (window as any).Materialize;

const routingTable: RouteDefs = {
  '/create': {
    render: (vnode: Vnode<{ id: number; editing: boolean }>) =>
      m(Layout, m(UserForm, { ...vnode.attrs, editing: false })),
  },
  '/edit/:id': {
    render: (vnode: Vnode<{ id: number; editing: boolean }>) =>
      m(Layout, m(UserForm, { ...vnode.attrs, editing: true })),
  },
  '/list': {
    render: () => m(Layout, m(UserList)),
  },
};

m.route(document.body, '/list', routingTable);
