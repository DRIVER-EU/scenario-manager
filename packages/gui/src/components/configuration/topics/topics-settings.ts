import m, { FactoryComponent } from 'mithril';
import { Collection, CollectionMode, TextInput, FlatButton } from 'mithril-materialized';
import { IMessageTopic, ITopicSubject, MessageType, ITrial, uniqueId } from 'trial-manager-models';
import { iterEnum } from '../../../utils';

/**
 * Configure the required topics, verify that they are available (via the adapter - TODO),
 * and assign them to a message type.
 */
export const TopicsSettings: FactoryComponent<{ trial: ITrial }> = () => {
  const state = {
    curTopicId: '',
    curMessageType: MessageType.ROLE_PLAYER_MESSAGE,
  };
  const byCurrentMessageType = (mt: IMessageTopic) => mt.messageType === state.curMessageType;

  return {
    oninit: ({ attrs: { trial } }) => {
      if (!trial.messageTopics) {
        trial.messageTopics = [];
      }
    },
    view: ({ attrs: { trial } }) => {
      const { curMessageType, curTopicId } = state;
      const messageTypes = iterEnum(MessageType).map(id => ({
        title: MessageType[id].replace(/_/g, ' '),
        active: id === curMessageType,
        onclick: () => (state.curMessageType = id as MessageType),
      }));
      const messageTopics = trial.messageTopics;
      let messageTopic = messageTopics.filter(byCurrentMessageType).shift();
      if (!messageTopic) {
        messageTopic = { messageType: curMessageType, topics: [] };
        messageTopics.push(messageTopic);
      }
      const topics = (messageTopic ? messageTopic.topics : messageTopics[messageTopics.length - 1].topics)
        .sort()
        .map(ts => ({
          title: `${ts.subject} ⇒ ${ts.topic}`,
          active: ts.id === curTopicId,
          onclick: () => (state.curTopicId = ts.id),
        }));
      const selectedTopic = (messageTopic
        ? messageTopic.topics.filter(t => t.id === curTopicId).shift() || {}
        : {}) as ITopicSubject;
      const { subject, topic } = selectedTopic;
      return m('.row.topics-settings', [
        m('.col.s6', m(Collection, { items: messageTypes, mode: CollectionMode.LINKS, header: 'Messages' })),
        m('.col.s6', [
          m('.row', m(Collection, { items: topics, mode: CollectionMode.LINKS, header: 'Topics' })),
          m('.row', [
            m(
              '.col.s12.m6',
              m(TextInput, {
                label: 'Subject',
                initialValue: subject,
                disabled: !curTopicId,
                onkeyup: (ev: KeyboardEvent, v?: string) => (v ? (selectedTopic.subject = v) : false),
              })
            ),
            m(
              '.col.s12.m6',
              m(TextInput, {
                label: 'Topic',
                initialValue: topic,
                disabled: !curTopicId,
                onkeyup: (ev: KeyboardEvent, v?: string) => (v && ev.key !== ' ' ? (selectedTopic.topic = v) : false),
              })
            ),
            m('.col.s12', [
              m(FlatButton, {
                iconName: 'add',
                // disabled: !topic || !subject,
                onclick: () => {
                  if (messageTopic) {
                    const id = uniqueId();
                    messageTopic.topics.push({ id, subject: '?', topic: '?' });
                    state.curTopicId = id;
                  }
                },
              }),
              m(FlatButton, {
                iconName: 'delete',
                disabled: !curTopicId,
                onclick: () => {
                  if (messageTopic) {
                    const ts = messageTopic.topics.filter(t => t.id === curTopicId).shift();
                    const index = ts && messageTopic.topics.indexOf(ts);
                    if (typeof index !== 'undefined' && index >= 0) {
                      messageTopic.topics.splice(index, 1);
                    }
                  }
                },
              }),
            ]),
          ]),
        ]),
      ]);
    },
  };
};
