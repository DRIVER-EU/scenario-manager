import { ApiModelProperty } from '@nestjs/swagger';
import { OneToMany, Entity } from 'typeorm';
import { Constraint } from '../constraint/constraint.entity';
import { Content } from '../content/content.entity';

@Entity()
export class BaseInject extends Content {
  constructor() { super(); }
  @ApiModelProperty({ type: Constraint, isArray: true })
  @OneToMany(() => Constraint, constraint => constraint.dependsOn, { eager: true, cascade: true })
  constraints: Constraint[];
}
