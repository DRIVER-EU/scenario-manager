import { M } from '../app';
import m, { Vnode } from 'mithril';
import { User } from '../models/user';
import { roundIconButton } from '../utils/html';

const log = console.log;

export const UserForm = () => {
  return {
    oninit: (vnode: Vnode<{ id: number; editing: boolean }>) => {
      return vnode.attrs.editing ? User.load(vnode.attrs.id) : User.new();
    },
    onupdate: () => M.updateTextFields(),
    view: (vnode: Vnode<{ id: number; editing: boolean }>) =>
      m(
        '.row',
        { style: 'color: black' },
        m(
          'form.col.s12',
          {
            onsubmit: (e: MouseEvent) => {
              log('submitting...');
              e.preventDefault();
              vnode.attrs.editing ? User.save() : User.create();
            },
          },
          m('.row', [
            [
              m('.input-field.col.s6', [
                m('i.material-icons.prefix', 'account_circle'),
                m('input.input[id=first][type=text]', {
                  oninput: m.withAttr('value', (value: string) => {
                    User.current.firstName = value;
                  }),
                  value: User.current.firstName,
                }),
                m('label.label[for=first]', 'First name'),
              ]),
              m('.input-field.col.s6', [
                m('input.input[type=text]', {
                  oninput: m.withAttr('value', (value: string) => {
                    User.current.lastName = value;
                  }),
                  value: User.current.lastName,
                }),
                m('label.label', 'Last name'),
              ]),
              m('.inline', [
                roundIconButton({ iconName: 'save', ui: { class: 'green', type: 'submit' } }),
                roundIconButton({
                  iconName: 'delete',
                  ui: { class: 'red', onclick: () => User.delete(User.current.id) },
                }),
              ]),
            ],
          ])
        )
      ),
  };
};
