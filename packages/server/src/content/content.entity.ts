import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';

@Entity()
export class Content {
  @ApiModelProperty()
  @ObjectIdColumn()
  id: ObjectID;

  @ApiModelProperty()
  @Column({ length: 500 })
  title: string;

  @ApiModelProperty()
  @Column('text')
  description: string;
}
