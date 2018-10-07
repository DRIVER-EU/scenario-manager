import { Entity, Column } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import { Content } from '../content/content.entity';

@Entity()
export class Objective extends Content {
  constructor() { super(); }

  @ApiModelProperty()
  @Column()
  scenarioId!: string;

  @ApiModelProperty()
  @Column({ nullable: true })
  parentId?: string;
}
