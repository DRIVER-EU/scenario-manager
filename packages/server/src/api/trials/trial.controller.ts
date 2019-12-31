import {
  ApiTags,
  ApiResponse,
  ApiQuery,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import {
  Res,
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Delete,
  Query,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { Operation } from 'rfc6902';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { TrialOverview, IUploadedFile } from '../../models';
import { TrialService } from './trial.service';
import { ApiFile } from '../../adapters/models/api-file';

@ApiTags('trials')
@Controller('trials')
export class TrialController {
  constructor(
    @Inject('TrialService') private readonly trialService: TrialService,
  ) {}

  @ApiOperation({ description: 'Get trials' })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'How many items to take (default 25)',
    type: Number,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'How many items to skip (default 0)',
    type: Number,
  })
  @ApiResponse({ status: 200, isArray: true, type: TrialOverview })
  @Get()
  findSome(@Query('skip') skip = 0, @Query('take') take = 25) {
    return this.trialService.findSome(skip, take);
  }

  @ApiOperation({ description: 'Create a trial' })
  @Post()
  async create(@Body() newTrial: TrialOverview) {
    return this.trialService.create(newTrial);
  }

  @ApiOperation({ description: 'Find a trial by id' })
  @ApiResponse({ status: 200, type: TrialOverview })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.trialService.findOne(id);
  }

  @ApiOperation({ description: 'Update a trial by id' })
  @ApiResponse({ status: 200, type: TrialOverview })
  @Put(':id')
  async update(@Param('id') id: string, @Body() scenario: TrialOverview) {
    // console.log(JSON.stringify(scenario, null, 2));
    return this.trialService.update(id, scenario);
  }

  @ApiOperation({ description: 'Patch a trial by id, where the patch represents a deep-diff between the current and new scenario.' })
  @ApiResponse({ status: 200, type: TrialOverview })
  @Patch(':id')
  async patch(@Param('id') id: string, @Body() patch: Operation[]) {
    // console.log(JSON.stringify(patch, null, 2));
    return this.trialService.patch(id, patch);
  }

  @ApiOperation({ description: 'Delete a trial by id' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      this.trialService.remove(id);
    } catch {}
  }

  @ApiOperation({ description: 'Add an asset to a trial' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @Post(':id/assets')
  async createAsset(
    @Param('id') id: string,
    @Body('alias') alias: string,
    @UploadedFile() file: IUploadedFile,
  ) {
    return this.trialService.createAsset(id, file, alias);
  }

  @ApiOperation({ description: 'Update an asset to a trial' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @Put(':id/assets/:asset')
  async updateAsset(
    @Param('id') id: string,
    @Param('asset') assetId: string,
    @Body('alias') alias: string,
    @UploadedFile() file: IUploadedFile,
  ) {
    return this.trialService.updateAsset(id, assetId, file, alias);
  }

  @ApiOperation({ description: 'Get all trial assets' })
  @Get(':id/assets')
  async getAssets(@Param('id') id: string) {
    return await this.trialService.getAssets(id);
  }

  @ApiOperation({ description: 'Get a trial asset by ID' })
  @Get(':id/assets/:asset')
  async getAsset(
    @Res() res: Response,
    @Param('id') id: string,
    @Param('asset') assetId: string,
  ) {
    const { data, mimetype, filename } = await this.trialService.getAsset(
      id,
      assetId,
    );
    res.writeHead(200, {
      'Content-Type': mimetype,
      'Content-disposition': 'attachment;filename=' + filename,
      'Content-Length': data.length,
    });
    res.end(data);
  }

  @ApiOperation({ description: 'Delete a trial asset by ID' })
  @Delete(':id/assets/:asset')
  async removeAsset(@Param('id') id: string, @Param('asset') assetId: string) {
    this.trialService.removeAsset(id, assetId);
  }
}
