import { IInject, InjectLevel } from '..';

/** Get the parent of an inject, specifying the inject level */
export const getParent = (injects: IInject[], id?: string, level = InjectLevel.SCENARIO): IInject | undefined => {
  if (!id) {
    return undefined;
  }
  let found = {} as IInject;
  injects.some(i => {
    if (i.id !== id) {
      return false;
    }
    found = i;
    return true;
  });
  if (found.level === level) {
    return found;
  } else {
    return getParent(injects, found.parentId, level);
  }
};
