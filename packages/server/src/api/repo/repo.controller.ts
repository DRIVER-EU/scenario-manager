import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import {
  Res,
  Controller,
  Get,
  Post,
  Param,
  Inject,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrialService } from '../trials/trial.service';
import { Response } from 'express';
import { ApiFile } from '../../adapters/models/api-file';

/** Users should be able to download the sqlite3 database */
@ApiTags('repo')
@Controller('repo')
export class RepoController {
  constructor(
    @Inject('TrialService') private readonly trialService: TrialService,
  ) {}

  @ApiOperation({ description: 'Download a trial as SQLite3 database by id' })
  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    const filename = this.trialService.getTrialFile(id);
    if (filename) {
      res.download(filename);
    }
  }

  @ApiOperation({ description: 'Create a copy of the Trial by id' })
  @Post('clone/:id')
  async clone(@Param('id') id: string) {
    const to = await this.trialService.clone(id);
    return to;
  }

  @ApiOperation({ description: 'Upload a trial as SQLite3 database' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiFile()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file) {
    this.trialService.createTrialFromFile(file);
  }
}
