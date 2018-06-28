import { Content } from 'content/content.entity';
import { Entity, ManyToOne } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import { Storyline } from 'storyline/storyline.entity';

@Entity()
export class BaseInject extends Content {
}

@Entity()
export class Inject extends BaseInject {
  @ApiModelProperty({ type: Storyline })
  @ManyToOne(type => Storyline, storyline => storyline.injects)
  storyline: Storyline;
}
