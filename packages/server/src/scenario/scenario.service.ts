import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scenario } from './scenario.entity';

@Injectable()
export class ScenarioService {
  constructor(
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
  ) { }

  async findOne(id: string): Promise<Scenario> {
    return await this.scenarioRepository.findOne(id);
  }

  async findAll(): Promise<Scenario[]> {
    return await this.scenarioRepository.find();
  }

  async update(id: string, scenario: Scenario) {
    return await this.scenarioRepository.update(id, scenario);
  }

  async create(scenario: Scenario) {
    if (!scenario.startDate) { scenario.startDate = Date.now(); }
    return await this.scenarioRepository.save(scenario);
  }

  async delete(id: string) {
    const scenario = await this.findOne(id);
    return await this.scenarioRepository.remove(scenario);
  }
}
