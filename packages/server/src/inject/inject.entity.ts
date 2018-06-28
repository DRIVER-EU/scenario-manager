import { Content } from 'content/content.entity';
import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import { Storyline } from 'storyline/storyline.entity';
import { Constraint } from 'constraint/constraint.entity';

@Entity()
export class BaseInject extends Content {
  @ApiModelProperty({ type: Constraint, isArray: true })
  @OneToMany(() => Constraint, constraint => constraint.dependsOn, { eager: true, cascade: true })
  constraints: Constraint[];
}

@Entity()
export class Inject extends BaseInject {
  @ApiModelProperty({ type: Storyline })
  @ManyToOne(type => Storyline, storyline => storyline.injects)
  storyline: Storyline;
}
