import { Controller, Get, Post, Body, Delete, Param, Put } from '@nestjs/common';
import { ApiUseTags, ApiResponse } from '@nestjs/swagger';
import { InjectService } from './inject.service';
import { Inject } from './inject.entity';

@ApiUseTags('inject')
@Controller('inject')
export class InjectController {
  constructor(private readonly service: InjectService) { }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(`Find inject by id: ${id}.`);
    return this.service.findOne(id);
  }

  @Get()
  async findAll() {
    console.log('Find all');
    return this.service.findAll();
  }

  @Get('scenario/:id')
  async findAllInScenario(@Param('id') id: string) {
    console.log('Find all in scenario with id ' + id);
    return this.service.findAllInScenario(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() inject: Inject) {
    console.log('Update: ' + JSON.stringify(inject));
    return this.service.update(id, inject);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'The record has been successfully created.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  async create(@Body() inject: Inject) {
    console.log('Create: ' + JSON.stringify(inject));
    return this.service.create(inject);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    console.log(`Delete inject by id ${id}.`);
    return this.service.delete(id);
  }
}
