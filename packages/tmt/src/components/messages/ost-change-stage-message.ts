import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, NumberInput } from 'mithril-materialized';
import { getMessage, IInject, MessageType, IOstStageChangeMessage, InjectKeys } from 'trial-manager-models';

/** Request the Observer Support Tool to change the list of questions for the observers */
export const OstChangeStageMessageForm: FactoryComponent<{
  inject: IInject;
  onChange?: (i: IInject, prop: InjectKeys) => void;
  disabled?: boolean;
}> = () => {
  return {
    view: ({ attrs: { inject, disabled, onChange } }) => {
      const pm = getMessage(inject, MessageType.CHANGE_OBSERVER_QUESTIONNAIRES) as IOstStageChangeMessage;
      const update = (prop: keyof IInject | Array<keyof IInject> = 'message') => onChange && onChange(inject, prop);

      return m('.row', [
        m(
          '.col.s12',
          m(TextInput, {
            disabled,
            id: 'title',
            initialValue: inject.title,
            onchange: (v: string) => {
              inject.title = v;
              update('title');
            },
            label: 'Title',
            iconName: 'title',
          })
        ),
        m(
          '.col.s12',
          m(TextArea, {
            disabled,
            id: 'desc',
            initialValue: inject.description,
            onchange: (v: string) => {
              inject.description = v;
              update('description');
            },
            label: 'Description',
            iconName: 'note',
          })
        ),
        m(
          '.col.s6',
          m(NumberInput, {
            disabled,
            id: 'ts1',
            initialValue: pm.ostTrialSessionId,
            onchange: (v: number) => {
              pm.ostTrialSessionId = v;
              update();
            },
            label: 'OST trial session ID',
            iconName: 'filter_1',
          })
        ),
        m(
          '.col.s6',
          m(NumberInput, {
            disabled,
            id: 'ts2',
            initialValue: pm.ostTrialStageId,
            onchange: (v: number) => {
              pm.ostTrialStageId = v;
              update();
            },
            label: 'OST trial stage ID',
            iconName: 'filter_2',
          })
        ),
      ]);
    },
  };
};
