import m from 'mithril';
import { IObjective } from './../models/objective';
import { roundIconButton, inputTextArea, inputText, button } from '../utils/html';
import { ObjectiveSvc } from '../services/objective-service';
import { ISubscriptionDefinition } from '../services/message-bus-service';
import { TopicNames, objectiveChannel } from '../models/channels';
import { deepCopy, deepEqual } from '../utils/utils';

const log = console.log;

export const ObjectiveForm = () => {
  const state = {
    parent: undefined as IObjective | undefined,
    objective: undefined as IObjective | undefined,
    original: undefined as IObjective | undefined,
    subscription: {} as ISubscriptionDefinition<any>,
  };

  const getParent = (id: string) =>
    ObjectiveSvc.getList()
      .filter(o => o.id === id)
      .shift();

  return {
    oninit: () => {
      state.subscription = objectiveChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
        state.objective = cur && cur.id ? deepCopy(cur) : undefined;
        state.original = cur && cur.id ? deepCopy(cur) : undefined;
        state.parent = cur.parentId ? getParent(cur.parentId) : undefined;
      });
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const parent = state.parent;
      const objective = state.objective;
      const hasChanged = !deepEqual(objective, state.original);
      return m(
        '.row',
        { style: 'color: black' },
        m(
          'form.col.s12',
          {
            onsubmit: (e: UIEvent) => {
              e.preventDefault();
              log('submitting...');
              if (objective) {
                ObjectiveSvc.update(objective);
              }
            },
          },
          [
            m(
              '.row',
              objective
                ? [
                    m('h4', parent ? `Secondary objective of "${parent.title}"` : 'Main objective'),
                    [
                      inputText({
                        id: 'title',
                        initialValue: objective.title,
                        onchange: (v: string) => (objective.title = v),
                        label: 'Title',
                        iconName: 'title',
                        classNames: 'active',
                      }),
                      inputTextArea({
                        id: 'desc',
                        initialValue: objective.description,
                        onchange: (v: string) => (objective.description = v),
                        label: 'Description',
                        iconName: 'description',
                        classNames: 'active',
                      }),
                    ],
                    m('row', [
                      button({
                        iconName: 'undo',
                        ui: {
                          class: `green ${hasChanged ? '' : 'disabled'}`,
                          onclick: () => (state.objective = deepCopy(state.original)),
                        },
                      }),
                      ' ',
                      button({
                        iconName: 'save',
                        ui: { class: `green ${hasChanged ? '' : 'disabled'}`, type: 'submit' },
                      }),
                      ' ',
                      button({
                        iconName: 'delete',
                        ui: { class: 'red', onclick: () => ObjectiveSvc.delete(objective.id) },
                      }),
                    ]),
                  ]
                : []
            ),
          ]
        )
      );
    },
  };
};
