import { Objective } from 'objective/objective.entity';
import { Content } from 'content/content.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

@Entity()
export class Scenario extends Content {
  @ApiModelProperty()
  @Column()
  startDate: number;

  @ApiModelPropertyOptional()
  @Column()
  endDate?: number;

  @ApiModelProperty({ type: Objective, isArray: true })
  @OneToMany(type => Objective, objective => objective.scenario)
  objectives: Objective[];
}
