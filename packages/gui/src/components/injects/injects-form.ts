import m from 'mithril';
import { TextInput, TextArea, Button, Icon } from 'mithril-materialized';
import { TopicNames, injectsChannel } from '../../models/channels';
import { deepCopy, deepEqual, getInjectIcon } from '../../utils/utils';
import { ScenarioSvc } from '../../services';
import { DropDownObjectives } from '../ui/drop-down-objectives';
import { IInject, InjectLevel, IInjectGroup } from '../../models';
import { InjectConditions } from './inject-conditions';

const log = console.log;

export const InjectsForm = () => {
  const state = {
    parent: undefined as IInject | IInjectGroup | undefined,
    inject: undefined as IInject | undefined,
    original: undefined as IInject | undefined,
    subscription: injectsChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
      state.inject = cur && cur.id ? deepCopy(cur) : undefined;
      state.original = cur && cur.id ? deepCopy(cur) : undefined;
      state.parent = cur.parentId ? getParent(cur.parentId) : undefined;
    }),
  };

  const getParent = (id: string) => (ScenarioSvc.getInjects() || []).filter(o => o.id === id).shift();

  return {
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { inject } = state;
      const isGroup = inject && inject.level !== InjectLevel.INJECT;
      const hasChanged = !deepEqual(inject, state.original);
      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        log('submitting...');
        if (inject) {
          ScenarioSvc.updateInject(inject);
        }
      };
      return m(
        '.injects-form',
        { style: 'color: black' },
        inject
          ? [
              m(
                '.row',
                m('.col.s12', [
                  m('h4', [
                    m(Icon, {
                      iconName: getInjectIcon(inject.level),
                      style: 'margin-right: 12px;',
                    }),
                    inject.level,
                  ]),
                  [
                    m(TextInput, {
                      id: 'title',
                      initialValue: inject.title,
                      onchange: (v: string) => (inject.title = v),
                      label: 'Title',
                      iconName: 'title',
                    }),
                    m(TextArea, {
                      id: 'desc',
                      initialValue: inject.description,
                      onchange: (v: string) => (inject.description = v),
                      label: 'Description',
                      iconName: 'description',
                    }),
                    m(InjectConditions, { inject }),
                    isGroup
                      ? m('.row', [
                          m(
                            '.col.s6',
                            m(DropDownObjectives, {
                              title: 'Main objective',
                              objectiveId: (inject as IInjectGroup).mainObjectiveId,
                              onchange: (id: string) => ((inject as IInjectGroup).mainObjectiveId = id),
                            })
                          ),
                          m(
                            '.col.s6',
                            m(DropDownObjectives, {
                              title: 'Secondary objective',
                              objectiveId: (inject as IInjectGroup).secondaryObjectiveId,
                              onchange: (id: string) => ((inject as IInjectGroup).secondaryObjectiveId = id),
                            })
                          ),
                        ])
                      : undefined,
                  ],
                  m('row', [
                    m(Button, {
                      iconName: 'undo',
                      class: `green ${hasChanged ? '' : 'disabled'}`,
                      onclick: () => (state.inject = deepCopy(state.original)),
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
                      onclick: () => ScenarioSvc.delete(inject.id),
                    }),
                  ]),
                ])
              ),
            ]
          : undefined
      );
    },
  };
};
