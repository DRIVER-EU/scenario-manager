import m from 'mithril';
import { IScenario, ITodo } from 'trial-manager-models';
import { FlatButton } from 'mithril-materialized';
import { MeiosisComponent } from '../../services';
import { getInject } from '../../utils';
import { UIForm } from 'mithril-ui-form';
import { IKanban, Kanban } from './kanban';

export const Checklist: MeiosisComponent = () => {
  const model = [
    {
      id: 'id',
      type: 'autogenerate',
      autogenerate: 'guid',
    },
    {
      id: 'title',
      label: 'Todo',
      type: 'text',
      className: 'col s12',
      required: true,
    },
  ] as UIForm<ITodo>;

  const disabledModel = [
    {
      id: 'title',
      label: 'Todo',
      type: 'text',
      className: 'col s9',
    },
    {
      id: 'done',
      label: 'Done',
      type: 'checkbox',
      className: 'col s3',
    },
  ] as UIForm<ITodo>;

  return {
    view: ({ attrs: { state, actions } }) => {
      const { mode } = state.app;
      const isEditing = mode === 'edit';
      const { trial, scenarioId } = isEditing ? state.app : state.exe;
      const { updateInject } = actions;
      const disabled = !isEditing;
      const scenario = getInject(trial, scenarioId) as IScenario;
      const { todoBefore, todoAfter } = scenario;

      return disabled === false || todoBefore || todoAfter
        ? m('.row', [
            m('.col.s6', [
              disabled ? m('h6', 'BEFORE') : undefined,
              [
                m(Kanban, {
                  i18n: {
                    newItem: 'Add todo (Before)',
                    modalCreateNewItem: 'Create todo',
                    modalDeleteItem: 'Delete todo',
                    modalEditNewItem: 'Edit todo',
                  },
                  disabled,
                  canDrag: true,
                  fixedFooter: true,
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
                  i18n: {
                    newItem: 'Add todo (After)',
                    modalCreateNewItem: 'Create todo',
                    modalDeleteItem: 'Delete todo',
                    modalEditNewItem: 'Edit todo',
                  },
                  disabled,
                  canDrag: true,
                  fixedFooter: true,
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
