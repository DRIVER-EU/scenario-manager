import { Objective } from './objective.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ObjectiveService {
  constructor(
    @InjectRepository(Objective)
    private readonly repository: Repository<Objective>,
  ) { }

  async findOne(id: string) {
    return await this.repository.findOne(id);
  }

  async findAll() {
    return await this.repository.find();
  }

  async update(id: string, scenario: Objective) {
    return await this.repository.update(id, scenario);
  }

  async create(scenario: Objective) {
    return await this.repository.save(scenario);
  }

  async delete(id: string) {
    const scenario = await this.findOne(id);
    return await this.repository.remove(scenario);
  }
}
