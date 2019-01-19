import { messageBus } from '../services/message-bus-service';
import { IScenario, IObjective, IInject, IPerson } from '.';

export const ChannelNames = {
  DEFAULT_CHANNEL: 'DEFAULT_CHANNEL',
  SCENARIO: 'SCENARIO',
  OBJECTIVE: 'OBJECTIVE',
  USERS: 'USERS',
  STAKEHOLDERS: 'STAKEHOLDERS',
  LOCATIONS: 'LOCATIONS',
  POI: 'POI',
  OOI: 'OOI',
  INJECT: 'INJECT',
};

export const TopicNames = {
  ALL: '#',
  ITEM: 'ITEM',
  ITEM_SELECT: 'ITEM.SELECT',
  ITEM_CREATE: 'ITEM.CREATE',
  ITEM_DELETE: 'ITEM.DELETE',
  ITEM_UPDATE: 'ITEM.UPDATE',
  LIST: 'LIST',
  LIST_CREATE: 'LIST.CREATE',
  LIST_DELETE: 'LIST.DELETE',
  LIST_UPDATE: 'LIST.UPDATE',
};

export const scenarioChannel = messageBus.channel<{ cur: IScenario; old?: IScenario }>(
  ChannelNames.SCENARIO
);

export const objectiveChannel = messageBus.channel<{ cur: IObjective; old?: IObjective }>(
  ChannelNames.OBJECTIVE
);

export const injectChannel = messageBus.channel<{ cur: IInject; old?: IInject }>(
  ChannelNames.INJECT
);

export const usersChannel = messageBus.channel<{ cur: IPerson; old?: IPerson }>(
  ChannelNames.USERS
);
