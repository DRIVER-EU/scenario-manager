import { M } from '../app';
import m, { Vnode } from 'mithril';
import { roundIconButton, inputTextArea, inputText } from '../utils/html';
import { ScenarioSvc } from '../services/scenario-service';
import { AppState } from '../models/app-state';

const log = console.log;
const close = () => {
  AppState.scenarioLoaded = false;
  m.route.set('/');
};

export const ScenarioForm = () => {
  return {
    oninit: (vnode: Vnode<{ id: number; editing: boolean }>) =>
      vnode.attrs.editing ? ScenarioSvc.load(vnode.attrs.id) : ScenarioSvc.new(),
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
              vnode.attrs.editing ? ScenarioSvc.save() : ScenarioSvc.create();
            },
          },
          [
            m('.row', [
              [
                inputText({
                  id: 'title',
                  initialValue: ScenarioSvc.current.title,
                  onchange: (v: string) => (ScenarioSvc.current.title = v),
                  label: 'Title',
                  iconName: 'title',
                }),
                inputTextArea({
                  id: 'desc',
                  initialValue: ScenarioSvc.current.description,
                  onchange: (v: string) => (ScenarioSvc.current.description = v),
                  label: 'Description',
                  iconName: 'description',
                }),
              ],
            ]),
            m('row.inline', [
              roundIconButton({ iconName: 'save', ui: { class: 'green', type: 'submit' } }),
              roundIconButton({ iconName: 'close', ui: { class: 'green', onclick: () => close() } }),
              roundIconButton({
                iconName: 'delete',
                ui: { class: 'red', onclick: () => ScenarioSvc.delete(ScenarioSvc.current.id) },
              }),
            ]),
          ]
        )
      ),
  };
};
