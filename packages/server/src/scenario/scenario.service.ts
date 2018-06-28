import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Scenario } from './scenario.entity';

@Injectable()
export class ScenarioService {
  constructor(
    @InjectRepository(Scenario)
    private readonly repository: Repository<Scenario>,
  ) { }

  async findOne(id: string) {
    return await this.repository.findOne(id);
  }

  async findAll() {
    return await this.repository.find();
  }

  async update(id: string, scenario: Scenario) {
    return await this.repository.update(id, scenario);
  }

  async create(scenario: Scenario) {
    if (!scenario.startDate) { scenario.startDate = Date.now(); }
    return await this.repository.save(scenario);
  }

  async delete(id: string) {
    const scenario = await this.findOne(id);
    return await this.repository.remove(scenario);
  }
}
