import { Column, Entity, OneToMany } from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Objective } from '../objective/objective.entity';
import { Content } from '../content/content.entity';
import { Storyline } from '../storyline/storyline.entity';

@Entity()
export class Scenario extends Content {
  constructor() { super(); }

  @ApiModelProperty()
  @Column()
  startDate: number;

  @ApiModelPropertyOptional()
  @Column()
  endDate?: number;

  @ApiModelProperty({ type: Objective, isArray: true })
  @OneToMany(type => Objective, objective => objective.scenario)
  objectives: Objective[];

  @ApiModelProperty({ type: Storyline, isArray: true })
  @OneToMany(type => Storyline, storyline => storyline.scenario)
  storylines: Storyline[];
}
