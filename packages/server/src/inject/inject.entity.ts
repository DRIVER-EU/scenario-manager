import { Entity, Column } from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { BaseInject } from './base-inject.entity';
import { InjectLevel } from '../models/inject-level';
import { InjectType } from '../models/inject-type';

@Entity()
export class Inject extends BaseInject {
  @ApiModelPropertyOptional()
  @Column({ nullable: true })
  mainObjectiveId?: string;

  @ApiModelPropertyOptional()
  @Column({ nullable: true })
  secondaryObjectiveId?: string;

  /** Who performs the action */
  @ApiModelPropertyOptional()
  @Column({ nullable: true })
  actorId?: string;

  /** Who is the recipient/receiver of the action/message */
  @ApiModelPropertyOptional()
  @Column({ nullable: true })
  recipientId?: string;

  /**
   * Depends on the successful execution/completion of another inject, where
   * an inject may also be an act or storyline:
   * - Each row can contain one or more IDs, comma separated.
   * - In case a row contains more IDs, separated by &, they are treated as AND conditions.
   * - Each row is treated as an OR condition.
   * E.g. ['a & b', 'c'] means that the pre-conditions of an inject are fullfilled
   * when c is completed, OR when a AND b are completed.
   */
  @ApiModelPropertyOptional()
  @Column({ type: 'varchar', array: true, nullable: true })
  dependsOn?: string[];

  @ApiModelPropertyOptional()
  @Column({ nullable: true })
  parentId?: string;

  @ApiModelProperty({ enum: InjectLevel })
  @Column({ nullable: true })
  level?: InjectLevel;

  @ApiModelProperty({ enum: InjectType })
  @Column({ nullable: true })
  type?: InjectType;
}
