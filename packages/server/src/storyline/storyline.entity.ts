import { Entity, ManyToOne, OneToMany, ManyToMany } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import { Scenario } from '../scenario/scenario.entity';
import { Inject } from '../inject/inject.entity';
import { Objective } from '../objective/objective.entity';
import { BaseInject } from '../inject/base-inject.entity';

@Entity()
export class Storyline extends BaseInject {
  constructor() { super(); }

  @ApiModelProperty({ type: Inject, isArray: true })
  @OneToMany(type => Inject, inject => inject.storyline)
  injects: Inject[];

  @ApiModelProperty({ type: Scenario })
  @ManyToOne(type => Scenario, scenario => scenario.storylines)
  scenario: Scenario;

  @ManyToMany(type => Objective, objective => objective.storylines, { eager: true })
  objectives: Objective[];
}
