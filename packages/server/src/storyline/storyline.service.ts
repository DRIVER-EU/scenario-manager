import { Storyline } from './storyline.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StorylineService {
  constructor(
    @InjectRepository(Storyline)
    private readonly repository: Repository<Storyline>,
  ) { }

  async findOne(id: string) {
    return await this.repository.findOne(id);
  }

  async findAll() {
    return await this.repository.find();
  }

  async update(id: string, storyline: Storyline) {
    return await this.repository.update(id, storyline);
  }

  async create(storyline: Storyline) {
    return await this.repository.save(storyline);
  }

  async delete(id: string) {
    const storyline = await this.findOne(id);
    return await this.repository.remove(storyline);
  }
}
