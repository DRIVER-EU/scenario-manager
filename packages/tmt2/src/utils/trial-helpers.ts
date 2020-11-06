import {
  deepCopy,
  getParent,
  IInject,
  InjectConditionType,
  InjectType,
  ITrial,
  MessageType,
  UserRole,
} from '../../../models/dist';
import { userRolesFilter } from './utils';

/** Get a user by ID */
export const getUserById = (trial: ITrial, id: string) => {
  const users = getUsers(trial);
  return users ? users.filter((u) => u.id === id).shift() : undefined;
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
  return getUsers(trial).filter((u) => userRolesFilter(u, role));
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

// Delete inject, including all children
export const canDeleteInject = (trial: ITrial, i: IInject) => {
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
