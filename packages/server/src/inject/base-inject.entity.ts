import { ApiModelProperty } from '@nestjs/swagger';
import { Entity, Column } from 'typeorm';
import { Constraint } from '../constraint/constraint.entity';
import { Content } from '../content/content.entity';
import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';

class ConstraintTransformer implements ValueTransformer {
  to(value?: Constraint[]): string {
    return value && value instanceof Array ? JSON.stringify([...value]) : '';
  }

  from(value: string): Constraint[] {
    return value ? JSON.parse(value) : [];
  }
}

@Entity()
export class BaseInject extends Content {
  constructor() {
    super();
  }

  @ApiModelProperty()
  @Column()
  scenarioId!: string;

  @ApiModelProperty({ type: Constraint, isArray: true })
  @Column({ type: String, transformer: new ConstraintTransformer() })
  constraints?: Constraint[];
}
