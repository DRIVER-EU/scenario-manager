import { Entity, Column } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import { BaseInject } from './base-inject.entity';

@Entity()
export class Inject extends BaseInject {
  @ApiModelProperty()
  @Column()
  storylineId?: string;
}
