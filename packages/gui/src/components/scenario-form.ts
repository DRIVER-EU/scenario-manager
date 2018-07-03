import { AppState } from './../models/app-state';
import { M } from '../app';
import m, { Vnode } from 'mithril';
import { Scenario } from '../models/scenario';
import { roundIconButton, inputTextArea, inputText } from './../utils/html';

const log = console.log;
const close = () => {
  AppState.scenarioLoaded = false;
  m.route.set('/');
};

export const ScenarioForm = () => {
  return {
    oninit: (vnode: Vnode<{ id: number; editing: boolean }>) =>
      vnode.attrs.editing ? Scenario.load(vnode.attrs.id) : Scenario.new(),
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
              vnode.attrs.editing ? Scenario.save() : Scenario.create();
            },
          },
          [
            m('.row', [
              [
                inputText({
                  id: 'title',
                  initialValue: Scenario.current.title,
                  onchange: (v: string) => Scenario.current.title = v,
                  label: 'Title',
                  icon: 'title',
                }),
                inputTextArea({
                  id: 'desc',
                  initialValue: Scenario.current.description,
                  onchange: (v: string) => Scenario.current.description = v,
                  label: 'Description',
                  icon: 'description',
                }),
              ],
            ]),
            m('row.inline', [
              roundIconButton('save', ['green'], { type: 'submit' }),
              roundIconButton('close', ['green'], {}, { onclick: () => close() }),
              roundIconButton('delete', ['red'], {}, { onclick: () => Scenario.delete(Scenario.current.id) }),
            ]),
          ]
        )
      ),
  };
};
