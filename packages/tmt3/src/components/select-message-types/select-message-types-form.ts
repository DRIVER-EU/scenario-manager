import m from 'mithril';
import { Label, Options } from 'mithril-materialized';
import { IKafkaMessage, MessageType } from 'trial-manager-models';
import { MeiosisComponent } from '../../services';
import { enumToOptions, getMessageTitleFromTemplate } from '../../utils';

/** Select which message types you want to send */
export const SelectMessageTypesForm: MeiosisComponent = () => {
  let getMessageTitle: (topic?: string) => string;
  return {
    oninit: ({
      attrs: {
        state: {
          app: { templates },
        },
      },
    }) => {
      getMessageTitle = getMessageTitleFromTemplate(templates);
    },
    view: ({
      attrs: {
        state: {
          app: { trial },
        },
        actions: { updateSelectedMessageTypes },
      },
    }) => {
      const { selectedMessageTypes = [] } = trial;
      const messageNames = selectedMessageTypes.map((sMsg: IKafkaMessage) => sMsg.name)
      const options = enumToOptions(MessageType).map(({ id }) => ({ id, label: getMessageTitle(id as MessageType) }));
      return m('.row', [
        [
          m('.col.s12.input-field', { style: 'margin-bottom: 1.2rem' }, m(Label, { label: 'Message types to send' })),
          m(
            '.col.s12',
            m(Options, {
              multiple: true,
              options,
              initialValue: messageNames,
              onchange: (ids) => updateSelectedMessageTypes(ids as string[]),
            })
          ),
        ],
      ]);
    },
  };
};
