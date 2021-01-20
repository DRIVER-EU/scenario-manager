import {
  deepCopy,
  getParent,
  IInject,
  InjectConditionType,
  InjectType,
  IScenario,
  ISessionManagement,
  ITrial,
  MessageType,
  UserRole,
} from '../../../models/dist';
import { hasUserRole } from './utils';
import { IActiveTrial } from '../services';
import { MessageScope } from '../components/messages';
import { IDependency, ITimelineItem } from 'mithril-scenario-timeline';

export const getActiveTrialInfo = <T extends IInject>(state: {
  app: IActiveTrial & { mode: MessageScope };
  exe: IActiveTrial;
}) => {
  const { mode } = state.app;
  const { trial, injectId, scenarioId, treeState } =
    mode === 'execute' && state.exe.trial && state.exe.trial.id ? state.exe : state.app;
  const inject = getInject(trial, injectId) as T;
  const scenario = scenarioId ? (getInject(trial, scenarioId) as IScenario) : undefined;
  return { trial, injectId, scenarioId, inject, scenario, treeState };
};

/** Get a user by ID */
export const getUserById = (trial: ITrial, id: string) => {
  const users = getUsers(trial);
  return users && users.filter((u) => u.id === id).shift();
};

/** Get all contacts (or filter by name) */
export const getUsers = (trial: ITrial, filter?: string) => {
  if (!trial || !trial.users) {
    return [];
  }
  return (filter
    ? trial.users.filter((u) => u.name && u.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
    : trial.users
  ).map((a) => a);
};

export const getUsersByRole = (trial: ITrial, role: UserRole) => {
  return getUsers(trial).filter((u) => hasUserRole(u, role));
};

/** Get all stakeholders (or filter by name) */
export const getStakeholders = (trial?: ITrial, filter?: string) => {
  if (!trial || !trial.stakeholders) {
    return [];
  }
  return filter
    ? trial.stakeholders.filter((s) => s.name && s.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
    : trial.stakeholders;
};

/** Get all objectives (or filter by name) */
export const getObjectives = (trial?: ITrial, filter?: string) => {
  if (!trial || !trial.objectives) {
    return [];
  }
  return filter
    ? trial.objectives.filter((s) => s.title && s.title.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
    : trial.objectives;
};

/** Get all injects (or filter by name) */
export const getInjects = (trial?: ITrial, filter?: string) => {
  if (!trial || !trial.injects) {
    return [];
  }
  return filter
    ? trial.injects.filter((s) => s.title && s.title.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
    : trial.injects;
};
/** Get a specific inject */

export const getInject = (trial?: ITrial, id?: string) => {
  return deepCopy(trial && trial.injects && id ? (trial.injects || []).filter((s) => s.id === id).shift() : undefined);
};

export const isSessionInfoValid = ({ id: sessionId, name: sessionName }: Partial<ISessionManagement>) =>
  sessionId && sessionId.length && sessionName && sessionName.length > 1 ? true : false;

// Delete inject, including all children
export const canDeleteInject = (trial: ITrial, i: IInject) => {
  if (i.type === InjectType.INJECT || i.type === InjectType.ACT) return true;
  const injects = getInjects(trial);
  const findChildren = (inject: IInject) => injects.filter((s) => s.parentId === inject.id);
  return findChildren(i).length === 0;
};

/** Check whether the injects are still valid, e.g. after deleting an inject, a depending inject becomes invalid. */
export const validateInjects = (trial: ITrial) => {
  if (!trial || !trial.injects) {
    return true;
  }

  const invalidateParents = (parentId?: string) => {
    if (!parentId) {
      return;
    }
    injects.some((i) => {
      if (i.id === parentId) {
        i.isValid = 'childInvalid';
        invalidateParents(i.parentId);
        return true;
      }
      return false;
    });
  };

  const injects = trial.injects;
  const ids = injects.map((i) => i.id);
  const errors = [] as string[];
  injects.forEach((i) => {
    if (i.condition && i.condition.injectId && ids.indexOf(i.condition.injectId) === -1) {
      errors.push(`Inject ${i.title} depends on a non-existing condition.`);
      i.isValid = 'invalid';
      invalidateParents(i.parentId);
    } else if (
      i.condition &&
      !(i.type === InjectType.SCENARIO || i.condition.type === InjectConditionType.AT_TIME || i.condition.injectId)
    ) {
      errors.push(`Inject ${i.title} has not defined the inject it depends on.`);
      i.isValid = 'invalid';
    } else {
      i.isValid = 'valid';
    }
  });
  if (errors.length > 0) {
    M.toast({
      html: errors.join('<br>'),
      classes: 'red',
    });
    return false;
  }
  return true;
};

/**
 * For injects, find injects in the same act that have been executed earlier, including the parent act itself.
 * For acts, find other acts in the same storyline that have been executed earlier, including the parent storyline.
 * For storylines, find other storylines in the same scenario that have been executed earlier, including the scenario.
 */
export const findPreviousInjects = (inject?: IInject, injects?: IInject[]) => {
  if (!injects || !inject) {
    return [];
  }
  const olderSiblings = (id: string | number) => {
    let found = false;
    return injects
      .filter((i) => i.parentId === id)
      .filter((i) => {
        found = i.id === inject.id;
        return !found;
      });
  };
  const type =
    inject.type === InjectType.INJECT
      ? InjectType.ACT
      : inject.type === InjectType.ACT
      ? InjectType.STORYLINE
      : InjectType.SCENARIO;
  const parent = getParent(injects, inject.id || inject.parentId, type);
  if (!parent) {
    return [];
  }
  return [parent, ...olderSiblings(parent.id)];
};

/**
 * Most messages must be published to Kafka, perhaps in different topics.
 * A direct relationship from message to topic is restrictive, and difficult to manage.
 * Therefore, we publish to a subject, which is linked to a topic.
 */
export const getMessageSubjects = (trial: ITrial, mt: MessageType) => {
  const messageTopics = trial.messageTopics || [];
  const messageTopic = messageTopics.filter((t) => t.messageType === mt).shift();
  return messageTopic ? messageTopic.topics.map((t) => ({ id: t.id, label: t.subject })) : [];
};

/**
 * Convert the timeline items to their reactive counterpart (IExecutingTimelineItem),
 * so start time and duration can be computed reactively.
 */
export const calcStartEndTimes = <T extends ITimelineItem & { startTime?: number; endTime?: number }>(items: T[]) => {
  const lookupMap = items.reduce(
    (acc, cur) => {
      const { id } = cur;
      acc[id] = {
        item: cur,
        start: [],
        end: [],
        hasStartTime: false,
        hasEndTime: false,
      };
      const { start, end } = acc[id];
      const children = items.filter((i) => i.parentId === id).map((i) => i.id);
      if (cur.dependsOn && cur.dependsOn.length) {
        acc[id].start = [...start, ...cur.dependsOn];
      }
      if (children.length) {
        acc[id].end = [...end, ...children.map((i) => ({ id: i, condition: 'finished' } as IDependency))];
      }
      return acc;
    },
    {} as {
      [id: string]: {
        item: T;
        /** All dependencies to determine the items start time */
        start: IDependency[];
        /** All dependencies to determine the items end time, i.e. its children's end time, if any. */
        end: IDependency[];
        /** If true, the start time is resolved */
        hasStartTime: boolean;
        /** If true, the end time is resolved */
        hasEndTime: boolean;
        /** Calculated list of child IDs */
        children?: string[];
      };
    }
  );

  const resolvable = (deps: IDependency[]) =>
    deps.reduce((acc, cur) => {
      return (
        acc &&
        lookupMap.hasOwnProperty(cur.id) &&
        (cur.condition === 'started' ? lookupMap[cur.id].hasStartTime : lookupMap[cur.id].hasEndTime)
      );
    }, true);

  // Resolve start/end times
  let keys = Object.keys(lookupMap);
  do {
    let hasChanged = false;
    keys = keys.filter((key) => {
      const { item, start, end, hasStartTime, hasEndTime } = lookupMap[key];
      if (!hasStartTime) {
        if (start.length === 0) {
          item.startTime = item.delay || 0;
          lookupMap[key].hasStartTime = true;
        } else {
          const canResolve = resolvable(start);
          if (canResolve) {
            item.startTime =
              (item.delay || 0) +
              Math.max(
                ...start.map(
                  (cur) =>
                    (cur.condition === 'started' ? lookupMap[cur.id].item.startTime : lookupMap[cur.id].item.endTime) ||
                    0
                )
              );
            lookupMap[key].hasStartTime = true;
          }
        }
      }
      if (!hasEndTime) {
        if (end.length === 0) {
          if (lookupMap[key].hasStartTime) {
            item.endTime = item.startTime;
            lookupMap[key].hasEndTime = true;
          }
        } else {
          const canResolve = resolvable(end);
          if (canResolve) {
            item.endTime = Math.max(
              ...end.map(
                (cur) =>
                  (cur.condition === 'started' ? lookupMap[cur.id].item.startTime : lookupMap[cur.id].item.endTime) || 0
              )
            );
            lookupMap[key].hasEndTime = true;
          }
        }
      }
      hasChanged =
        hasChanged || hasStartTime !== lookupMap[key].hasStartTime || hasEndTime !== lookupMap[key].hasEndTime;
      return !(lookupMap[key].hasStartTime && lookupMap[key].hasEndTime);
    });
    if (!hasChanged && keys.length) {
      // console.error(JSON.stringify(lookupMap, null, 2));
      // console.error(JSON.stringify(keys, null, 2));
      // TODO Add error callback, and mention possible circular dependencies, e.g.
      // Return all items that haven't been resolved
      // Inspect those for head/tail dependencies, i.e. A waits for B to finish, while B waits for A to start.
      // keys.length = 0; // To stop the loop
      throw new Error('Cannot resolve circular dependencies');
    }
  } while (keys.length);

  // Convert to array
  return Object.keys(lookupMap).reduce((acc, cur) => {
    acc.push(lookupMap[cur].item);
    return acc;
  }, [] as T[]);
};
