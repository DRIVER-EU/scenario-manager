import { Controller, Get, Post, Body, Delete, Param, Put } from '@nestjs/common';
import { ApiUseTags, ApiResponse } from '@nestjs/swagger';
import { ConstraintService } from './constraint.service';
import { Constraint } from './constraint.entity';

@ApiUseTags('constraint')
@Controller('constraint')
export class ConstraintController {
  constructor(private readonly service: ConstraintService) { }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(`Find constraint by id: ${id}.`);
    return this.service.findOne(id);
  }

  @Get()
  async findAll() {
    console.log('Find all');
    return this.service.findAll();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() constraint: Constraint) {
    console.log('Update: ' + JSON.stringify(constraint));
    return this.service.update(id, constraint);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'The record has been successfully created.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  async create(@Body() constraint: Constraint) {
    console.log('Create: ' + JSON.stringify(constraint));
    return this.service.create(constraint);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    console.log(`Delete constraint by id ${id}.`);
    return this.service.delete(id);
  }
}
