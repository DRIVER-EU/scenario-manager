import m from 'mithril';
import { MeiosisComponent } from '../../services';
import { Select, Button, TextInput } from 'mithril-materialized';
import { IKafkaMessage } from 'trial-manager-models';

export const KafkaMessage: MeiosisComponent = () => {
  let fileName = '' as string;
  let topicName = '' as string;
  return {
    view: ({
      attrs: {
        state: {
          app: { trial: curTrial, kafkaTopics },
        },
        actions,
      },
    }) => {
      const { selectedMessageTypes } = curTrial;
      const optionList = kafkaTopics.map((topic: string) => {
        return { id: topic, label: topic };
      });
      console.log(selectedMessageTypes);
      return m('.row', [
        m('.col.s12', [
          m('h4', 'Add new message'),
          m(TextInput, {
            id: 'name',
            isMandatory: true,
            onchange: (v: string) => (fileName = v),
            label: 'Message Name',
            placeholder: 'No spaces allowed',
            className: 'col s12',
          }),
          m(Select, {
            label: 'Kafka topic for the message',
            className: 'col s12',
            placeholder: 'Message type',
            options: optionList,
            onchange: (v) => {
              topicName = v[0] as string;
            },
          }),
          m(Button, {
            label: 'Add Message',
            class: 'col s2',
            onclick: () => {
              actions.saveNewKafkaMessage(fileName, topicName);
              fileName = '';
              topicName = '';
            },
          }),
        ]),
        m(
          'div.col.s12',
          m('div.row', [
            m('p.col.s3', { style: 'font-weight:bold' }, 'JSON Name'),
            m('p.col.s3', { style: 'font-weight:bold' }, 'Kafka Topic'),
          ]),
          selectedMessageTypes.map((entr: IKafkaMessage) => {
            return m('div.row', [
              m('p.col.s3', entr.name),
              m('p.col.s3', entr.topic),
              m(Button, {
                label: 'delete',
                class: 'red col s1',
                iconName: 'delete',
                onclick: () => {
                  actions.deleteKafkaMessage(entr);
                },
              }),
            ]);
          })
        ),
      ]);
    },
  };
};
