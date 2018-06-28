import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Constraint } from './constraint.entity';

@Injectable()
export class ConstraintService {
  constructor(
    @InjectRepository(Constraint)
    private readonly repository: Repository<Constraint>,
  ) { }

  async findOne(id: string) {
    return await this.repository.findOne(id);
  }

  async findAll() {
    return await this.repository.find();
  }

  async update(id: string, constraint: Constraint) {
    return await this.repository.update(id, constraint);
  }

  async create(constraint: Constraint) {
    return await this.repository.save(constraint);
  }

  async delete(id: string) {
    const constraint = await this.findOne(id);
    return await this.repository.remove(constraint);
  }
}
