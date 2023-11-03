import {
  IAsset,
  IMessageTopic,
  IObjective,
  IStakeholder,
  IInjectGroup,
  IInject,
  IPerson,
  MessageType,
  Resource,
} from './index.js';

export interface ITrialOverview {
  /** Refers to the filename on disk */
  id: string;
  /** Title of the scenario */
  title: string;
  /** Scenario description */
  description?: string;
  /** When the scenario was created */
  creationDate?: Date;
  /** When the scenario was edited */
  lastEdit?: Date;
  // boundingBox: number[];
}

export interface IKafkaMessage {
  id: string;
  name: string;
  /** Id of the template */
  templateId: string;
  messageType: MessageType;
  kafkaTopic: string;
  useNamespace: boolean;
  namespace?: string;
  iconName: string;
  useCustomGUI: boolean;
  asset?: IAsset;
  customGUI?: string;
}

export interface ITrial extends ITrialOverview {
  /** Specifies relation between message types and topics */
  messageTopics: IMessageTopic[];
  // /** Objects of interest that play a role in the scenario */
  // objects: IObjectOfInterest[];
  // /** Persons of interest that play a role in the scenario */
  // players: IPersonOfInterest[];
  // /** Locations of interest that play a role in the scenario */
  // locations: ILocationAddress[];
  /** Persons that can login, and play one of more roles, such as editors, stakeholders, role players */
  users: IPerson[];
  /** Resources that play a role in one of the scenarios */
  resources?: Resource[];
  /** Solutions, departments, organisations that have an interest in the scenario */
  stakeholders: IStakeholder[];
  /** Objectives that need to be satisfied by the scenario */
  objectives: IObjective[];
  /** The actual messages that encompass the scenario */
  injects: Array<IInject | IInjectGroup>;
  /** The actual message types that will be used */
  selectedMessageTypes: IKafkaMessage[];
}
