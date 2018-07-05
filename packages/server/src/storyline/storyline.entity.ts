import { Entity, OneToMany, Column } from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Inject } from '../inject/inject.entity';
import { BaseInject } from '../inject/base-inject.entity';

@Entity()
export class Storyline extends BaseInject {
  constructor() { super(); }

  @ApiModelPropertyOptional()
  @Column({ nullable: true })
  objectiveId?: string;
}
