import {
  IContent,
  IObjective,
  IStakeholder,
  IInjectGroup,
  IInject,
  IPerson,
  ILocation,
  IPersonOfInterest,
  IObjectOfInterest,
  IAsset,
} from '.';

export interface ITrial extends IContent {
  /** When does the scenario start */
  startDate?: Date;
  /** When does the scenario end */
  endDate?: Date;
  /** When is the scenario created */
  createdDate: Date;
  /** When is the scenario last updated */
  updatedDate: Date;
  /** Objects of interest that play a role in the scenario */
  objects: IObjectOfInterest[];
  /** Persons of interest that play a role in the scenario */
  players: IPersonOfInterest[];
  /** Locations of interest that play a role in the scenario */
  locations: ILocation[];
  /** Persons that can login, and play one of more roles, such as editors, stakeholders, role players */
  users: IPerson[];
  /** Solutions, departments, organisations that have an interest in the scenario */
  stakeholders: IStakeholder[];
  /** Objectives that need to be satisfied by the scenario */
  objectives: IObjective[];
  /** The actual messages that encompass the scenario */
  injects: Array<IInject | IInjectGroup>;
}
