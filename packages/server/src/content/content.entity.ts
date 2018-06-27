import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm';

@Entity()
export class Content {
  @ObjectIdColumn()
  id: ObjectID;

  @Column({ length: 500 })
  title: string;

  @Column('text')
  description: string;
}