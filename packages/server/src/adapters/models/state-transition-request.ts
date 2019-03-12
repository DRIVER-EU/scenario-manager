import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IStateTransitionRequest, InjectState } from 'trial-manager-models';

/** Describes a manual state transition request, e.g. when a role player wants to set the state to EXECUTED. */
export class StateTransitionRequest implements IStateTransitionRequest {
  @ApiModelProperty({ description: 'Inject ID' })
  public readonly id: string;
  @ApiModelProperty({ description: 'Current state' })
  public readonly from: InjectState;
  @ApiModelProperty({ description: 'Requested new state' })
  public readonly to: InjectState;
  @ApiModelProperty({ description: 'Optional comment when making a transition' })
  public readonly comment?: string;

  constructor(id: string, from: InjectState, to: InjectState, comment?: string) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.comment = comment;
  }
}
