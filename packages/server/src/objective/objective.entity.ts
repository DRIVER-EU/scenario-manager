import { Scenario } from 'scenario/scenario.entity';
import { Content } from 'content/content.entity';
import { Entity, OneToMany, ManyToOne } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';

@Entity()
export class Objective extends Content {
  // @ApiModelProperty( { type: Objective })
  @ManyToOne(type => Objective, objective => objective.children)
  parent: Objective;

  // @ApiModelProperty({ type: Objective, isArray: true })
  @OneToMany(type => Objective, objective => objective.parent)
  children: Objective[];

  @ApiModelProperty({ type: Scenario })
  @ManyToOne(type => Scenario, scenario => scenario.objectives)
  scenario: Scenario;
}
