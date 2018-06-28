import { Controller, Get, Post, Body, Delete, Param, Put } from '@nestjs/common';
import { ApiUseTags, ApiResponse } from '@nestjs/swagger';
import { StorylineService } from './storyline.service';
import { Storyline } from './storyline.entity';

@ApiUseTags('storyline')
@Controller('storyline')
export class StorylineController {
  constructor(private readonly service: StorylineService) { }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(`Find storyline by id: ${id}.`);
    return this.service.findOne(id);
  }

  @Get()
  async findAll() {
    console.log('Find all');
    return this.service.findAll();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() storyline: Storyline) {
    console.log('Update: ' + JSON.stringify(storyline));
    return this.service.update(id, storyline);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'The record has been successfully created.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  async create(@Body() storyline: Storyline) {
    console.log('Create: ' + JSON.stringify(storyline));
    return this.service.create(storyline);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    console.log(`Delete storyline by id ${id}.`);
    return this.service.delete(id);
  }
}
