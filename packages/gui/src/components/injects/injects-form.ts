import m, { FactoryComponent } from 'mithril';
import { Button, Icon, Dropdown } from 'mithril-materialized';
import { getInjectIcon, findPreviousInjects } from '../../utils';
import { TrialSvc } from '../../services';
import { IInject, InjectType, IInjectGroup, deepCopy, deepEqual, getInject } from 'trial-manager-models';
import { TopicNames, injectsChannel } from '../../models';
import { InjectConditions } from './inject-conditions';
import { MessageForm } from '../messages/message-form';

const log = console.log;

export const InjectsForm: FactoryComponent<{}> = () => {
  const state = {
    parent: undefined as IInject | IInjectGroup | undefined,
    inject: undefined as IInject | undefined,
    original: undefined as IInject | undefined,
    subscription: injectsChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
      state.inject = cur ? deepCopy(cur) : undefined;
      state.original = cur ? deepCopy(cur) : undefined;
      state.parent = cur.parentId ? getInject(cur.parentId, TrialSvc.getInjects()) : undefined;
    }),
  };

  return {
    onremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { inject } = state;
      const hasChanged = !deepEqual(inject, state.original);
      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        log('submitting...');
        if (inject) {
          // const copy = deepCopy(inject);
          // HACK Remove children from tree
          // delete (inject as any).children;
          TrialSvc.updateInject(inject);
        }
      };
      const previousInjects = findPreviousInjects(inject, TrialSvc.getInjects());

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
                      iconName: getInjectIcon(inject.type),
                      style: 'margin-right: 12px;',
                    }),
                    inject.type,
                  ]),
                  [
                    m(MessageForm, { inject }),
                    m(InjectConditions, { inject, previousInjects }),
                    m(SetObjectives, { inject }),
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
                      onclick: () => TrialSvc.deleteInject(inject),
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

/** Allows to set the main and secondary objective */
export const SetObjectives: FactoryComponent<{ inject: IInject }> = () => {
  return {
    view: ({ attrs: { inject } }) => {
      const isGroup = inject && inject.type !== InjectType.INJECT;
      const objectives = [{ id: '', title: 'Pick one' }, ...(TrialSvc.getObjectives() || [])].map(o => ({
        id: o.id,
        label: o.title,
      }));

      return isGroup
        ? m('.row', [
            m(Dropdown, {
              contentClass: 'col s6',
              helperText: 'Main objective',
              checkedId: (inject as IInjectGroup).mainObjectiveId,
              items: objectives,
              onchange: (id: string | number) => ((inject as IInjectGroup).mainObjectiveId = id as string),
            }),
            (inject as IInjectGroup).mainObjectiveId
              ? m(Dropdown, {
                  contentClass: 'col s6',
                  helperText: 'Secondary objective',
                  checkedId: (inject as IInjectGroup).secondaryObjectiveId,
                  items: objectives,
                  onchange: (id: string | number) => ((inject as IInjectGroup).secondaryObjectiveId = id as string),
                })
              : undefined,
          ])
        : undefined;
    },
  };
};
