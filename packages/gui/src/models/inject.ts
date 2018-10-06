import { IContent } from './content';
import { ISelectable } from './selectable';
import { IExpandable } from './expandable';

export enum InjectType {
  INJECT = 'INJECT',
  ACT = 'ACT',
  STORYLINE = 'STORYLINE',
}

export interface IInject extends IContent {
  injectType: InjectType;
  scenarioId: string;
  parentId?: string;
  mainObjectiveId?: string;
  secondaryObjectiveId?: string;
}

export interface IInjectVM extends IInject, ISelectable, IExpandable { }
