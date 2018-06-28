import { Scenario } from 'scenario/scenario.entity';
import { Content } from 'content/content.entity';
import { Entity, OneToMany, ManyToOne, ManyToMany } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import { Storyline } from 'storyline/storyline.entity';

@Entity()
export class Objective extends Content {
  // @ApiModelProperty( { type: Objective })
  @ManyToOne(type => Objective, objective => objective.children)
  parent: Objective;

  // @ApiModelProperty({ type: Objective, isArray: true })
  @OneToMany(type => Objective, objective => objective.parent, { eager: true })
  children: Objective[];

  @ApiModelProperty({ type: Scenario })
  @ManyToOne(type => Scenario, scenario => scenario.objectives)
  scenario: Scenario;

  @ManyToMany(type => Storyline, storyline => storyline.objectives)
  storylines: Storyline[];
}
