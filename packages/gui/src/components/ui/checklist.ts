import m, { FactoryComponent } from 'mithril';
import { IScenario, ITodo } from 'trial-manager-models';
import { Kanban, IModelField, IKanban } from 'mithril-materialized';

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

export const Checklist: FactoryComponent<{ scenario: IScenario; onChange: () => void }> = () => {
  const state = {} as { onChange: () => void; };

  const onchange = (scenario: IScenario, type: 'before' | 'after') => (items: ITodo[]) => {
    if (type === 'before') {
      scenario.todoBefore = items as ITodo[];
    } else {
      scenario.todoAfter = items;
    }
    console.log('onchange');
    state.onChange();
  };

  return {
    oninit: ({ attrs: { onChange }}) => {
      state.onChange = onChange;
    },
    view: ({ attrs: { scenario }}) => {
      return m('.row', [
        m(
          '.col.s6',
          m(Kanban, {
            label: 'todo (BEFORE)',
            canDrag: true,
            model,
            onchange: onchange(scenario, 'before'),
            items: scenario.todoBefore,
          } as IKanban<ITodo>)
        ),
        m(
          '.col.s6',
          m(Kanban, {
            label: 'todo (AFTER)',
            canDrag: true,
            model,
            onchange: onchange(scenario, 'after'),
            items: scenario.todoAfter,
          } as IKanban<ITodo>)
        ),
      ]);
    },
  };
};
