import { Controller, Get, Post, Body, Delete, Param, Put } from '@nestjs/common';
import { ApiUseTags, ApiResponse } from '@nestjs/swagger';
import { ObjectiveService } from './objective.service';
import { Objective } from './objective.entity';

@ApiUseTags('objective')
@Controller('objective')
export class ObjectiveController {
  constructor(private readonly service: ObjectiveService) { }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(`Find objective by id: ${id}.`);
    return this.service.findOne(id);
  }

  @Get()
  async findAll() {
    console.log('Find all');
    return this.service.findAll();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() objective: Objective) {
    console.log('Update: ' + JSON.stringify(objective));
    return this.service.update(id, objective);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'The record has been successfully created.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  async create(@Body() objective: Objective) {
    console.log('Create: ' + JSON.stringify(objective));
    return this.service.create(objective);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    console.log(`Delete objective by id ${id}.`);
    return this.service.delete(id);
  }
}
