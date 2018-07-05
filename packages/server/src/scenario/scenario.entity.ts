import {
  Column,
  Entity,
  OneToMany,
  UpdateDateColumn,
  VersionColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Objective } from '../objective/objective.entity';
import { Content } from '../content/content.entity';
import { Storyline } from '../storyline/storyline.entity';

@Entity()
export class Scenario extends Content {
  constructor() {
    super();
  }

  @ApiModelProperty()
  @Column()
  startDate: Date;

  @ApiModelPropertyOptional()
  @Column({ nullable: true })
  endDate?: Date;

  @ApiModelProperty()
  @CreateDateColumn()
  createdDate: Date;

  @ApiModelProperty()
  @UpdateDateColumn()
  updatedDate: Date;

  @ApiModelProperty()
  @VersionColumn()
  version: number;
}
