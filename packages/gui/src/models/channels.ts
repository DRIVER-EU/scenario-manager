import { Objective } from './../../../server/src/objective/objective.entity';
import { Scenario } from './../../../server/src/scenario/scenario.entity';
import { Inject } from './../../../server/src/inject/inject.entity';
import { messageBus } from '../services/message-bus-service';

export const ChannelNames = {
  DEFAULT_CHANNEL: 'DEFAULT_CHANNEL',
  SCENARIO: 'SCENARIO',
  OBJECTIVE: 'OBJECTIVE',
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

export const scenarioChannel = messageBus.channel<{ cur: Scenario; old?: Scenario }>(
  ChannelNames.SCENARIO
);

export const objectiveChannel = messageBus.channel<{ cur: Objective; old?: Objective }>(
  ChannelNames.OBJECTIVE
);

export const injectChannel = messageBus.channel<{ cur: Inject; old?: Inject }>(
  ChannelNames.INJECT
);
