import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from './inject.entity';

@Injectable()
export class InjectService {
  constructor(
    @InjectRepository(Inject)
    private readonly repository: Repository<Inject>,
  ) { }

  async findOne(id: string) {
    return await this.repository.findOne(id);
  }

  async findAll() {
    return await this.repository.find();
  }

  async findAllInScenario(scenarioId: string) {
    return await this.repository.find({
      where: { scenarioId },
    });
  }

  async update(id: string, inject: Inject) {
    return await this.repository.update(id, inject);
  }

  async create(inject: Inject) {
    return await this.repository.save(inject);
  }

  async delete(id: string) {
    const inject = await this.findOne(id);
    return await this.repository.remove(inject);
  }
}
