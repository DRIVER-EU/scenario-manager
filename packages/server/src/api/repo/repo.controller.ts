import { ApiUseTags, ApiOperation } from '@nestjs/swagger';
import { Res, Controller, Get, Param, Inject } from '@nestjs/common';
import { TrialService } from '../trials/trial.service';
import { Response } from 'express';

/** Users should be able to download the sqlite3 database */
@ApiUseTags('repo')
@Controller('repo')
export class RepoController {
  constructor(@Inject('TrialService') private readonly trialService: TrialService) {}

  @ApiOperation({ title: 'Download a trial as SQLite3 database by id' })
  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    const filename = await this.trialService.getTrialFile(id);
    res.download(filename);
  }
}
