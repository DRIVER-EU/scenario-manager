import { Content } from 'content/content.entity';
import { CreateDateColumn, Entity } from 'typeorm';

@Entity()
export class Scenario extends Content {
  @CreateDateColumn()
  startDate: number;

  @CreateDateColumn()
  endDate: Date;
}