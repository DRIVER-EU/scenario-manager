import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IStateTransitionRequest, InjectState } from '../../../../models';

/** Describes a manual state transition request, e.g. when a role player wants to set the state to EXECUTED. */
export class StateTransitionRequest implements IStateTransitionRequest {
  @ApiProperty({ description: 'Inject ID' })
  public readonly id: string;
  @ApiProperty({ description: 'Current state' })
  public readonly from: InjectState;
  @ApiProperty({ description: 'Requested new state' })
  public readonly to: InjectState;
  @ApiPropertyOptional({
    description: 'Expected time of execution (Date.valueOf())',
  })
  public readonly expectedExecutionTimeAt?: number;
  @ApiPropertyOptional({
    description: 'Optional comment when making a transition',
  })
  public readonly comment?: string;

  constructor(
    id: string,
    from: InjectState,
    to: InjectState,
    expectedExecutionTimeAt?: number,
    comment?: string,
  ) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.expectedExecutionTimeAt = expectedExecutionTimeAt;
    this.comment = comment;
  }
}
