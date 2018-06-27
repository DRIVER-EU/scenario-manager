import { Content } from 'content/content.entity';
import { Column, Entity } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';

@Entity()
export class Scenario extends Content {
  @ApiModelProperty()
  @Column()
  startDate: number;

  @ApiModelProperty()
  @Column()
  endDate?: number;
}
