import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ObjectID } from 'typeorm';
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

  async create(scenario: Scenario) {
    if (!scenario.startDate) { scenario.startDate = Date.now(); }
    if (!scenario.endDate) { scenario.endDate = new Date(); }
    return await this.scenarioRepository.save(scenario);
  }

  async delete(id: string) {
    const scenario = await this.findOne(id);
    return await this.scenarioRepository.remove(scenario);
  }
}
