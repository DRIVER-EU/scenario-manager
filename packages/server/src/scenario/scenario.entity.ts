import {
  Column,
  Entity,
  UpdateDateColumn,
  VersionColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Content } from '../content/content.entity';

@Entity()
export class Scenario extends Content {
  constructor() {
    super();
  }

  @ApiModelProperty()
  @Column({ nullable: true })
  startDate?: Date;

  @ApiModelPropertyOptional()
  @Column({ nullable: true })
  endDate?: Date;

  @ApiModelProperty()
  @CreateDateColumn()
  createdDate!: Date;

  @ApiModelProperty()
  @UpdateDateColumn()
  updatedDate!: Date;

  @ApiModelProperty()
  @VersionColumn()
  version!: number;
}
