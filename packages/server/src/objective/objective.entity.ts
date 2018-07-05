import { Entity, OneToMany, ManyToOne, ManyToMany, Column } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import { Scenario } from '../scenario/scenario.entity';
import { Content } from '../content/content.entity';
import { Storyline } from '../storyline/storyline.entity';

@Entity()
export class Objective extends Content {
  constructor() { super(); }

  @ApiModelProperty()
  @Column()
  scenarioId: string;

  @ApiModelProperty()
  @Column({ nullable: true })
  parentId?: string;
}
