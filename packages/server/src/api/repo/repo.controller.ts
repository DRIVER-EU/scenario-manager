import { ApiUseTags, ApiOperation } from '@nestjs/swagger';
import { Res, Controller, Get, Param } from '@nestjs/common';
import { ScenarioService } from '../scenarios/scenario.service';
import { Response } from 'express';

/** Users should be able to download the sqlite3 database */
@ApiUseTags('repo')
@Controller('repo')
export class RepoController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @ApiOperation({ title: 'Download a scenario as SQLite3 database by id' })
  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    const filename = await this.scenarioService.getScenarioFile(id);
    res.download(filename);
  }
}
