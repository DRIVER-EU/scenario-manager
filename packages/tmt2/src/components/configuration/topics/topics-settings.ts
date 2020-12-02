import m from 'mithril';
import { Collection, CollectionMode, TextInput, FlatButton } from 'mithril-materialized';
import { deepCopy, IMessageTopic, ITopicSubject, MessageType, uniqueId } from '../../../../../models';
import { MeiosisComponent } from '../../../services';
import { enumToOptions, getMessageTitle } from '../../../utils';

/**
 * Configure the required topics, verify that they are available (via the adapter - TODO),
 * and assign them to a message type.
 */
export const TopicsSettings: MeiosisComponent = () => {
  const state = {
    curTopicId: '',
    curMessageType: MessageType.ROLE_PLAYER_MESSAGE,
  };
  const byCurrentMessageType = (mt: IMessageTopic) => mt.messageType === state.curMessageType;

  return {
    view: ({
      attrs: {
        state: {
          app: { trial },
        },
        actions: { updateMessageTopics },
      },
    }) => {
      const { curMessageType, curTopicId } = state;
      const messageTopics = deepCopy(trial.messageTopics || []);
      const messageTypes = enumToOptions(MessageType).map(({ id }) => ({
        title: getMessageTitle(id),
        active: id === curMessageType,
        onclick: () => (state.curMessageType = id as MessageType),
      }));
      let messageTopic = messageTopics.filter(byCurrentMessageType).shift();
      if (!messageTopic) {
        messageTopic = { messageType: curMessageType, topics: [] };
        messageTopics.push(messageTopic);
      }
      const topics = (messageTopic ? messageTopic.topics : messageTopics[messageTopics.length - 1].topics)
        .sort()
        .map((ts) => ({
          title: `${ts.subject} ⇒ ${ts.topic}`,
          active: ts.id === curTopicId,
          onclick: () => (state.curTopicId = ts.id),
        }));
      const selectedTopic = (messageTopic
        ? messageTopic.topics.filter((t) => t.id === curTopicId).shift() || {}
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
                onchange: (v) => {
                  selectedTopic.subject = v;
                  updateMessageTopics(messageTopics);
                },
              })
            ),
            m(
              '.col.s12.m6',
              m(TextInput, {
                label: 'Topic',
                initialValue: topic,
                disabled: !curTopicId,
                onchange: (v) => {
                  selectedTopic.topic = v;
                  updateMessageTopics(messageTopics);
                },
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
                    updateMessageTopics(messageTopics);
                  }
                },
              }),
              m(FlatButton, {
                iconName: 'save',
                disabled: !curTopicId,
                onclick: () => {
                  updateMessageTopics(messageTopics);
                },
              }),
              m(FlatButton, {
                iconName: 'delete',
                disabled: !curTopicId,
                onclick: () => {
                  if (messageTopic) {
                    const ts = messageTopic.topics.filter((t) => t.id === curTopicId).shift();
                    const index = ts && messageTopic.topics.indexOf(ts);
                    if (typeof index !== 'undefined' && index >= 0) {
                      messageTopic.topics.splice(index, 1);
                    }
                    updateMessageTopics(messageTopics);
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
