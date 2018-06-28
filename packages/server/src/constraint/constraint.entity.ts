import { BaseInject } from 'inject/inject.entity';
import { Entity, Column, ObjectIdColumn, ObjectID, OneToOne, ManyToOne } from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

export enum ConstraintType {
  MANUAL,
  ABSOLUTE_TIME,
  RELATIVE_TIME,
  ON_STORYLINE_START,
  ON_STORYLINE_END,
  ON_INJECT_START,
  ON_INJECT_END,
  ON_EVENT,
}

@Entity()
export class Constraint {
  @ApiModelProperty()
  @ObjectIdColumn()
  id: ObjectID;

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
  dependsOn: BaseInject;

  @ApiModelPropertyOptional()
  @Column()
  eventName: string;
}
