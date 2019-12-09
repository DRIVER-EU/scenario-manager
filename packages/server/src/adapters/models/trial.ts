import { ApiModelProperty } from '@nestjs/swagger';
import { ITrial, IExecutingInject, IPerson, IInjectGroup } from 'trial-manager-models';

/** Describes a manual state transition request, e.g. when a role player wants to set the state to EXECUTED. */
export class Trial implements Partial<ITrial> {
  @ApiModelProperty({ description: 'Trial ID' })
  public readonly id: string;
  @ApiModelProperty({ description: 'Trial title' })
  public readonly title: string;
  @ApiModelProperty({ description: 'Executing injects' })
  public readonly injects: Array<IExecutingInject | IInjectGroup>;
  @ApiModelProperty({ description: 'Users' })
  public readonly users: IPerson[];
  @ApiModelProperty({ description: 'Selected message types' })
  public readonly selectedMessageTypes: string[];

  constructor(
    id: string,
    title: string,
    injects: Array<IExecutingInject | IInjectGroup>,
    users: IPerson[],
    selectedMessageTypes: string[],
  ) {
    this.id = id;
    this.title = title;
    this.injects = injects;
    this.users = users;
    this.selectedMessageTypes = selectedMessageTypes;
  }
}
