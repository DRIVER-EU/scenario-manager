import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';

@Entity()
export class Content {
  @ApiModelProperty()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiModelProperty()
  @Column({ length: 500, default: '' })
  title!: string;

  @ApiModelProperty()
  @Column('text', { nullable: true, default: '' })
  description!: string;
}
