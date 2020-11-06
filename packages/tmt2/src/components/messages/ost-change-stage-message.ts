import m from 'mithril';
import { TextArea, TextInput, NumberInput } from 'mithril-materialized';
import { getMessage, MessageType, IOstStageChangeMessage } from '../../../../models';
import { MeiosisComponent } from '../../services';
import { getInject } from '../../utils';

/** Request the Observer Support Tool to change the list of questions for the observers */
export const OstChangeStageMessageForm: MeiosisComponent = () => {
  return {
    view: ({
      attrs: {
        state: {
          app: { trial, injectId, mode },
        },
        actions: { updateInject },
      },
    }) => {
      const disabled = mode !== 'edit';
      const inject = getInject(trial, injectId);
      if (!inject) return;
      const pm = getMessage<IOstStageChangeMessage>(inject, MessageType.CHANGE_OBSERVER_QUESTIONNAIRES);

      return m('.row', [
        m(
          '.col.s12',
          m(TextInput, {
            disabled,
            id: 'title',
            initialValue: inject.title,
            onchange: (v: string) => {
              inject.title = v;
              updateInject(inject);
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
              updateInject(inject);
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
              updateInject(inject);
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
              updateInject(inject);
            },
            label: 'OST trial stage ID',
            iconName: 'filter_2',
          })
        ),
      ]);
    },
  };
};
