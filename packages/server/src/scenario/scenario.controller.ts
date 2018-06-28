import { ApiUseTags, ApiResponse } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Delete, Param, Put } from '@nestjs/common';
import { Scenario } from './scenario.entity';
import { ScenarioService } from './scenario.service';

@ApiUseTags('scenario')
@Controller('scenario')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) { }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(`Find scenario by id: ${id}.`);
    return this.scenarioService.findOne(id);
  }

  @Get()
  async findAll() {
    console.log('Find all');
    return this.scenarioService.findAll();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() scenario: Scenario) {
    console.log('Update: ' + JSON.stringify(scenario));
    return this.scenarioService.update(id, scenario);
  }

  @Post()
  // @ApiImplicitBody( { name: 'scenario', description: 'The new scenario', required: true })
  @ApiResponse({ status: 201, description: 'The record has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.'})
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
