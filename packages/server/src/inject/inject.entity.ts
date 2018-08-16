import { Entity, Column } from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { BaseInject } from './base-inject.entity';

export enum InjectType {
  INJECT = 'INJECT',
  ACT = 'ACT',
  STORYLINE = 'STORYLINE',
}

@Entity()
export class Inject extends BaseInject {
  @ApiModelPropertyOptional()
  @Column({ nullable: true })
  objectiveId?: string;

  @ApiModelPropertyOptional()
  @Column({ nullable: true })
  parentId?: string;

  @ApiModelProperty({ enum: InjectType })
  @Column()
  type: InjectType;
}
