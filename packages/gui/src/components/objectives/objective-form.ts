import m from 'mithril';
import { TextInput, TextArea, Button, Icon } from 'mithril-materialized';
import { ISubscriptionDefinition } from '../../services/message-bus-service';
import { TopicNames, objectiveChannel } from '../../models/channels';
import { deepCopy, deepEqual } from '../../utils/utils';
import { IObjective } from '../../models/objective';
import { IScenario } from './../../models/scenario';
import { ScenarioSvc } from '../../services/scenario-service';

const log = console.log;

export const ObjectiveForm = () => {
  const state = {
    scenario: undefined as IScenario | undefined,
    parent: undefined as IObjective | undefined,
    objective: undefined as IObjective | undefined,
    original: undefined as IObjective | undefined,
    subscription: {} as ISubscriptionDefinition<any>,
  };

  const getParent = (id: string) => (ScenarioSvc.getObjectives() || []).filter(o => o.id === id).shift();

  return {
    oninit: () => {
      state.scenario = ScenarioSvc.getCurrent();
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
      const objective = state.objective;
      const hasChanged = !deepEqual(objective, state.original);
      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        log('submitting...');
        if (objective) {
          objectiveChannel.publish(TopicNames.ITEM_UPDATE, { cur: objective });
          ScenarioSvc.updateObjective(objective);
        }
      };
      return m(
        '.row',
        { style: 'color: black' },
        m('form.col.s12', [
          m(
            '.objectives-form',
            objective
              ? [
                  m('h4', [
                    m(Icon, {
                      iconName: 'my_location',
                      style: 'margin-right: 12px;',
                    }),
                    `${objective.parentId ? 'Secondary' : 'Main'} objective`,
                  ]),
                  [
                    m(TextInput, {
                      id: 'title',
                      initialValue: objective.title,
                      onchange: (v: string) => (objective.title = v),
                      label: 'Title',
                      iconName: 'title',
                      contentClass: 'active',
                    }),
                    m(TextArea, {
                      id: 'desc',
                      initialValue: objective.description,
                      onchange: (v: string) => (objective.description = v),
                      label: 'Description',
                      iconName: 'description',
                      contentClass: 'active',
                    }),
                  ],
                  m('row', [
                    m(Button, {
                      iconName: 'undo',
                      class: `green ${hasChanged ? '' : 'disabled'}`,
                      onclick: () => (state.objective = deepCopy(state.original)),
                    }),
                    ' ',
                    m(Button, {
                      iconName: 'save',
                      class: `green ${hasChanged ? '' : 'disabled'}`,
                      onclick: onsubmit,
                    }),
                    ' ',
                    m(Button, {
                      iconName: 'delete',
                      class: 'red',
                      onclick: () => ScenarioSvc.deleteObjective(objective),
                    }),
                  ]),
                ]
              : []
          ),
        ])
      );
    },
  };
};
