import { ApiProperty } from '@nestjs/swagger';
import {
  ITrial,
  IExecutingInject,
  IPerson,
  IInjectGroup,
  IKafkaMessage,
} from '../../../../models';

/** Describes a manual state transition request, e.g. when a role player wants to set the state to EXECUTED. */
export class Trial implements Partial<ITrial> {
  @ApiProperty({ description: 'Trial ID' })
  public readonly id: string;
  @ApiProperty({ description: 'Trial title' })
  public readonly title: string;
  @ApiProperty({ description: 'Executing injects' })
  public readonly injects: Array<IExecutingInject | IInjectGroup>;
  @ApiProperty({ description: 'Users' })
  public readonly users: IPerson[];
  @ApiProperty({ description: 'Selected message types' })
  public readonly selectedMessageTypes:  IKafkaMessage[];

  constructor(
    id: string,
    title: string,
    injects: Array<IExecutingInject | IInjectGroup>,
    users: IPerson[],
    selectedMessageTypes: IKafkaMessage[],
  ) {
    this.id = id;
    this.title = title;
    this.injects = injects;
    this.users = users;
    this.selectedMessageTypes = selectedMessageTypes;
  }
}
