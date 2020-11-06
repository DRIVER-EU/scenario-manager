import m from 'mithril';
import { IScenario, ITodo } from '../../../../models';
import { FlatButton, Kanban, IModelField, IKanban } from 'mithril-materialized';
import { MeiosisComponent } from '../../services';
import { getInject } from '../../utils';

export const Checklist: MeiosisComponent = () => {
  // let key = 0;
  const model = [
    {
      id: 'title',
      label: 'Todo',
      component: 'text',
      className: 'col s12',
      required: true,
    },
    {
      id: 'id',
      autogenerate: 'guid',
    },
  ] as IModelField[];

  const disabledModel = [
    {
      id: 'title',
      label: 'Todo',
      component: 'text',
      className: 'col s9',
      required: true,
    },
    {
      id: 'done',
      label: 'Done',
      component: 'checkbox',
      className: 'col s3',
    },
  ] as IModelField[];

  return {
    oninit: () => console.log('ONINIT Checklist'),
    view: ({ attrs: { state, actions } }) => {
      const { trial, scenarioId, mode } = state.app;
      const { updateInject } = actions;
      const disabled = mode !== 'edit';
      const scenario = getInject(trial, scenarioId) as IScenario;
      const { todoBefore, todoAfter } = scenario;

      return disabled === false || todoBefore || todoAfter
        ? m('.row', [
            m('.col.s6', [
              disabled ? m('h6', 'BEFORE') : undefined,
              [
                m(Kanban, {
                  disabled,
                  label: 'todo (BEFORE)',
                  canDrag: true,
                  model: disabled ? disabledModel : model,
                  onchange: (items) => {
                    scenario.todoBefore = items;
                    updateInject(scenario);
                  },
                  items: todoBefore,
                  editableIds: disabled ? ['done'] : undefined,
                } as IKanban<ITodo>),
              ],
            ]),
            m('.col.s6', [
              disabled ? m('h6', 'AFTER') : undefined,
              [
                m(Kanban, {
                  disabled,
                  label: 'todo (AFTER)',
                  canDrag: true,
                  model: disabled ? disabledModel : model,
                  onchange: (items) => {
                    scenario.todoAfter = items;
                    updateInject(scenario);
                  },
                  // onchange: onchange(scenario, 'after'),
                  items: todoAfter,
                  editableIds: disabled ? ['done'] : undefined,
                } as IKanban<ITodo>),
              ],
            ]),
            disabled &&
              m(
                '.row',
                m(
                  '.col.s12',
                  m(FlatButton, {
                    label: 'Clear all todos',
                    iconName: 'clear_all',
                    onclick: () => {
                      if (todoBefore) {
                        scenario.todoBefore = todoBefore.map((todo) => ({ ...todo, done: false }));
                        updateInject(scenario);
                        // onchange(scenario, 'before');
                      }
                      if (todoAfter) {
                        scenario.todoAfter = todoAfter.map((todo) => ({ ...todo, done: false }));
                        updateInject(scenario);
                        // onchange(scenario, 'after');
                      }
                    },
                  })
                )
              ),
          ])
        : undefined;
    },
  };
};
