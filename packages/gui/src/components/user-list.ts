import { button } from './../utils/html';
import m from 'mithril';
import { User } from './../models/user';

export const UserList = () => ({
  oncreate: User.loadList,
  view: () =>
    m('ul.collection', [
      User.list.map((user) =>
        m(
          'a.collection-item',
          {
            href: '/edit/' + user.id,
            oncreate: m.route.link,
          },
          `${user.firstName} ${user.lastName}`
        )
      ),
      ,
      button('New user', {}, { href: '/create', oncreate: m.route.link }),
      // m('a.waves-effect.waves-light.btn', { href: '/create', oncreate: m.route.link }, 'New user'),
    ]),
});
