import m from 'mithril';
import { inputTextArea, inputText, button, smallIcon } from '../../utils/html';
import { ISubscriptionDefinition } from '../../services/message-bus-service';
import { TopicNames, injectChannel } from '../../models/channels';
import { deepCopy, deepEqual, getInjectIcon } from '../../utils/utils';
import { InjectSvc } from '../../services/inject-service';
import { IInject } from '../../models/inject';

const log = console.log;

export const InjectsForm = () => {
  const state = {
    parent: undefined as IInject | undefined,
    inject: undefined as IInject | undefined,
    original: undefined as IInject | undefined,
    subscription: {} as ISubscriptionDefinition<any>,
  };

  const getParent = (id: string) =>
    InjectSvc.getList()
      .filter(o => o.id === id)
      .shift();

  return {
    oninit: () => {
      state.subscription = injectChannel.subscribe(TopicNames.ITEM, ({ cur }) => {
        state.inject = cur && cur.id ? deepCopy(cur) : undefined;
        state.original = cur && cur.id ? deepCopy(cur) : undefined;
        state.parent = cur.parentId ? getParent(cur.parentId) : undefined;
      });
    },
    onbeforeremove: () => {
      state.subscription.unsubscribe();
    },
    view: () => {
      const parent = state.parent;
      const inject = state.inject;
      const hasChanged = !deepEqual(inject, state.original);
      return m(
        '.injects-form',
        { style: 'color: black' },
        m(
          'form.col.s12',
          {
            onsubmit: (e: UIEvent) => {
              e.preventDefault();
              log('submitting...');
              if (inject) {
                InjectSvc.update(inject);
              }
            },
          },
          [
            m(
              '.row',
              inject
                ? [
                    m('h4', [smallIcon(getInjectIcon(inject.type), { style: 'margin-right: 12px;' }), inject.type]),
                    [
                      inputText({
                        id: 'title',
                        initialValue: inject.title,
                        onchange: (v: string) => (inject.title = v),
                        label: 'Title',
                        iconName: 'title',
                        classNames: 'active',
                      }),
                      inputTextArea({
                        id: 'desc',
                        initialValue: inject.description,
                        onchange: (v: string) => (inject.description = v),
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
                          onclick: () => (state.inject = deepCopy(state.original)),
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
                        ui: { class: 'red', onclick: () => InjectSvc.delete(inject.id) },
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
