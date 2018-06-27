import { ObjectID } from 'typeorm';
import { ScenarioService } from './scenario.service';
import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { Scenario } from './scenario.entity';

@Controller('scenario')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) { }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Scenario> {
    console.log(`Find scenario by id: ${id}.`);
    return this.scenarioService.findOne(id);
  }

  @Get()
  async findAll(): Promise<Scenario[]> {
    console.log('Find all');
    return this.scenarioService.findAll();
  }

  @Post()
  async create(@Body() scenario: Scenario) {
    console.log('Create: ' + JSON.stringify(scenario));
    return this.scenarioService.create(scenario);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    console.log(`Delete scenario by id ${id}.`);
    return this.scenarioService.delete(id);
  }
}
