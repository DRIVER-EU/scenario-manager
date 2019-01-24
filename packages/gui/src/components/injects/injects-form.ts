import m, { FactoryComponent } from 'mithril';
import { Button, Icon, Dropdown, Select } from 'mithril-materialized';
import { deepCopy, deepEqual, getInjectIcon } from '../../utils';
import { TrialSvc } from '../../services';
import { TopicNames, injectsChannel, IInject, InjectLevel, IInjectGroup, InjectType } from '../../models';
import { InjectConditions } from './inject-conditions';
import { MessageForm } from '../messages/message-form';

const log = console.log;

export const InjectsForm: FactoryComponent<{}> = () => {
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

  const getParent = (id: string) => (TrialSvc.getInjects() || []).filter(o => o.id === id).shift();

  return {
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const { inject } = state;
      const hasChanged = !deepEqual(inject, state.original);
      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        log('submitting...');
        if (inject) {
          TrialSvc.updateInject(inject);
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
                  [m(MessageForm, { inject }), m(InjectConditions, { inject }), m(SetConditions, { inject })],
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
                      onclick: () => TrialSvc.delete(inject.id),
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

export const SetConditions: FactoryComponent<{ inject: IInject }> = () => {
  return {
    view: ({ attrs: { inject } }) => {
      const isGroup = inject && inject.level !== InjectLevel.INJECT;
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
