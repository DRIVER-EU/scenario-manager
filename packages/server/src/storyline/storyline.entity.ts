import { Scenario } from 'scenario/scenario.entity';
import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import { Inject, BaseInject } from 'inject/inject.entity';

@Entity()
export class Storyline extends BaseInject {
  @ApiModelProperty({ type: Inject, isArray: true })
  @OneToMany(type => Inject, inject => inject.storyline)
  injects: Inject[];

  @ApiModelProperty({ type: Scenario })
  @ManyToOne(type => Scenario, scenario => scenario.storylines)
  scenario: Scenario;
}
