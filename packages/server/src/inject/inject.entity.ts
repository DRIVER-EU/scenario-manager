import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import { Storyline } from '../storyline/storyline.entity';
import { BaseInject } from './base-inject.entity';

@Entity()
export class Inject extends BaseInject {
  @ApiModelProperty({ type: Storyline })
  @ManyToOne(type => Storyline, storyline => storyline.injects)
  storyline: Storyline;
}
