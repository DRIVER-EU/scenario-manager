import { IContent } from './content';
import { ISelectable } from './selectable';
import { IExpandable } from './expandable';

export interface IObjective extends IContent {
  parentId: string;
  scenarioId: string;
}

export interface IObjectiveVM extends IObjective, ISelectable, IExpandable { }
