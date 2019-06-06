import m, { FactoryComponent, Attributes } from 'mithril';
import { Button, Icon, Dropdown, Select } from 'mithril-materialized';
import { getInjectIcon, findPreviousInjects, getMessageIcon, getMessageTitle, enumToOptions } from '../../utils';
import { TrialSvc } from '../../services';
import { IInject, InjectType, IInjectGroup, deepCopy, deepEqual, getInject, MessageType } from 'trial-manager-models';
import { TopicNames, injectsChannel } from '../../models';
import { InjectConditions } from './inject-conditions';
import { MessageForm } from '../messages/message-form';

const log = console.log;

export interface IInjectsForm extends Attributes {
  disabled?: boolean;
}

export const InjectsForm: FactoryComponent<IInjectsForm> = () => {
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
    view: ({ attrs: { className, disabled = false } }) => {
      const { inject, original } = state;
      const onChange = () => {
        state.inject = inject;
        m.redraw();
      };
      const hasChanged = !deepEqual(inject, original);
      const onsubmit = (e: UIEvent) => {
        e.preventDefault();
        log('submitting...');
        if (inject) {
          TrialSvc.updateInject(inject);
        }
      };
      const previousInjects = findPreviousInjects(inject, TrialSvc.getInjects());
      const options = enumToOptions(MessageType).map(({ id }) => ({ id, label: getMessageTitle(id as MessageType) }));

      return m(
        '.row.injects-form.sb.large',
        { style: 'color: black; padding-bottom: 10px;', className },
        inject
          ? [
              m('.col.s12', [
                inject.type === InjectType.INJECT
                  ? m(Select, {
                      disabled,
                      iconName: getMessageIcon(inject.messageType),
                      placeholder: 'Select the message type',
                      checkedId: inject.messageType,
                      options,
                      onchange: v => {
                        console.warn('Getting message form');
                        inject.messageType = v && v.length > 0 ? (v[0] as MessageType) : undefined;
                      },
                    })
                  : m('h4', [
                      m(Icon, {
                        iconName: getInjectIcon(inject.type),
                        style: 'margin-right: 12px;',
                      }),
                      inject.type,
                    ]),
                [
                  m(MessageForm, { disabled, inject, onChange, key: inject.id }),
                  m(InjectConditions, { disabled, inject, previousInjects }),
                  m(SetObjectives, { disabled, inject }),
                ],
                m(
                  'row',
                  disabled
                    ? undefined
                    : [
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
                          disabled: !TrialSvc.canDeleteInject(inject),
                          onclick: async () => {
                            const { parentId } = inject;
                            state.inject = undefined;
                            const injects = TrialSvc.getInjects() || [];
                            const parent = injects.filter(i => i.id === parentId).shift() || injects[0];
                            await TrialSvc.deleteInject(inject);
                            injectsChannel.publish(TopicNames.ITEM_SELECT, { cur: parent });
                          },
                        }),
                      ]
                ),
              ]),
            ]
          : undefined
      );
    },
  };
};

/** Allows to set the main and secondary objective */
export const SetObjectives: FactoryComponent<{ inject: IInject; disabled?: boolean }> = () => {
  return {
    view: ({ attrs: { inject, disabled = false } }) => {
      const isGroup = inject && inject.type !== InjectType.INJECT;
      const objectives = [{ id: '', title: 'Pick one' }, ...(TrialSvc.getObjectives() || [])].map(o => ({
        id: o.id,
        label: o.title,
      }));
      const injectGroup = inject as IInjectGroup;

      return isGroup
        ? m('.row', [
            m(Dropdown, {
              disabled,
              id: 'primary',
              className: 'col s6',
              helperText: 'Main objective',
              checkedId: injectGroup.mainObjectiveId,
              items: objectives,
              onchange: (id: string | number) => (injectGroup.mainObjectiveId = id as string),
            }),
            injectGroup.mainObjectiveId
              ? m(Dropdown, {
                  disabled,
                  id: 'secondary',
                  className: 'col s6',
                  helperText: 'Secondary objective',
                  checkedId: injectGroup.secondaryObjectiveId,
                  items: objectives,
                  onchange: (id: string | number) => (injectGroup.secondaryObjectiveId = id as string),
                })
              : undefined,
          ])
        : undefined;
    },
  };
};
