import { Entity, Column, ObjectIdColumn, ObjectID, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { BaseInject } from '../inject/base-inject.entity';

export enum ConstraintType {
  MANUAL,
  ABSOLUTE_TIME,
  RELATIVE_TIME,
  ON_STORYLINE_START,
  ON_STORYLINE_END,
  ON_ACT_START,
  ON_ACT_END,
  ON_INJECT_START,
  ON_INJECT_END,
  ON_EVENT,
}

@Entity()
export class Constraint {
  constructor(type: ConstraintType) {
    this.type = type;
    this.delay = 0;
  }

  @ApiModelProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiModelProperty({ enum: ConstraintType })
  @Column()
  type: ConstraintType;

  @ApiModelPropertyOptional()
  @Column()
  /**
   * Time delay in msec, either based on the scenario start time
   * (when using ABSOLUTE_TIME), or on a relative time after a
   * previous inject or storyline.
   */
  delay: number;

  @ApiModelProperty({ type: BaseInject })
  @ManyToOne(() => BaseInject, baseInject => baseInject.constraints)
  dependsOn?: BaseInject;

  @ApiModelPropertyOptional()
  @Column()
  eventName?: string;
}
