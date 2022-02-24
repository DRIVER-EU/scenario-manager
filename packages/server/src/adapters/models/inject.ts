import { ApiProperty } from '@nestjs/swagger';
import { IInject, InjectType } from 'trial-manager-models';

/** Describes a manual state transition request, e.g. when a role player wants to set the state to EXECUTED. */
export class Inject implements IInject {
  @ApiProperty({ description: 'Inject ID' })
  public readonly id: string;
  @ApiProperty({ description: 'Inject title' })
  public readonly title: string;
  @ApiProperty({ description: 'Inject type' })
  public readonly type: InjectType;

  constructor(id: string, title: string, type: InjectType) {
    this.id = id;
    this.title = title;
    this.type = type;
  }
}
