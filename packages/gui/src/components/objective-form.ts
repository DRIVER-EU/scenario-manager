import m from 'mithril';
import { roundIconButton, inputTextArea, inputText } from '../utils/html';
import { ScenarioSvc } from './../services/scenario-service';
import { ObjectiveSvc } from '../services/objective-service';
import { AppState } from '../models/app-state';

const log = console.log;

export const ObjectiveForm = () => {
  const getParent = (id: string) =>
    ObjectiveSvc.list.filter((o) => o.parentId && o.parentId === id).shift() || AppState.objectives.parent;
  return {
    oninit: () => ObjectiveSvc.new(),
    view: () =>
      m(
        '.row',
        { style: 'color: black' },
        m(
          'form.col.s12',
          {
            onsubmit: (e: MouseEvent) => {
              log('submitting...');
              ObjectiveSvc.current.scenarioId = ScenarioSvc.current.id;
              ObjectiveSvc.current.id ? ObjectiveSvc.save() : ObjectiveSvc.create();
            },
          },
          [
            m('.row', [
              m(
                'h4',
                getParent(ObjectiveSvc.current.parentId)
                  ? `Child of ${getParent(ObjectiveSvc.current.parentId).title}`
                  : 'New top-level objective'
              ),
              [
                inputText({
                  id: 'title',
                  initialValue: ObjectiveSvc.current.title,
                  onchange: (v: string) => (ObjectiveSvc.current.title = v),
                  label: 'Title',
                  iconName: 'title',
                }),
                inputTextArea({
                  id: 'desc',
                  initialValue: ObjectiveSvc.current.description,
                  onchange: (v: string) => (ObjectiveSvc.current.description = v),
                  label: 'Description',
                  iconName: 'description',
                }),
              ],
            ]),
            m('row.inline', [
              roundIconButton({ iconName: 'save', ui: { class: 'green', type: 'submit' } }),
              roundIconButton({
                iconName: 'delete',
                ui: { class: 'red', onclick: () => ObjectiveSvc.delete(ObjectiveSvc.current.id) },
              }),
            ]),
          ]
        )
      ),
  };
};
