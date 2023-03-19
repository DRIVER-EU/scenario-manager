import { MessageType } from './index.js';

/** A Kafka topic name can easily change. Therefore, publish messages to a subject, and map the subject to a topic. */
export interface ITopicSubject {
  id: string;
  topic: string;
  subject: string;
}

/** A message type is related to a list of topics to which it  may publish (or subscribe) */
export interface IMessageTopic {
  messageType: MessageType;
  topics: ITopicSubject[];
}
