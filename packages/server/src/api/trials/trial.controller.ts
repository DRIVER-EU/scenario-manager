import {
  ApiUseTags,
  ApiResponse,
  ApiImplicitQuery,
  ApiOperation,
  ApiConsumes,
  ApiImplicitFile,
} from '@nestjs/swagger';
import {
  Res,
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Query,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  FileInterceptor,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { TrialOverview, IUploadedFile } from '../../models';
import { TrialService } from './trial.service';

@ApiUseTags('trials')
@Controller('trials')
export class TrialController {
  constructor(
    @Inject('TrialService') private readonly trialService: TrialService,
  ) {}

  @ApiOperation({ title: 'Get trials' })
  @ApiImplicitQuery({
    name: 'take',
    required: false,
    description: 'How many items to take (default 25)',
    type: Number,
  })
  @ApiImplicitQuery({
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

  @ApiOperation({ title: 'Create a trial' })
  @Post()
  async create(@Body() newTrial: TrialOverview) {
    return this.trialService.create(newTrial);
  }

  @ApiOperation({ title: 'Find a trial by id' })
  @ApiResponse({ status: 200, type: TrialOverview })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.trialService.findOne(id);
  }

  @ApiOperation({ title: 'Update a trial by id' })
  @ApiResponse({ status: 200, type: TrialOverview })
  @Put(':id')
  async update(@Param('id') id: string, @Body() scenario: TrialOverview) {
    return this.trialService.update(id, scenario);
  }

  @ApiOperation({ title: 'Delete a trial by id' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      this.trialService.remove(id);
    } catch {}
  }

  @ApiOperation({ title: 'Add an asset to a trial' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiImplicitFile({
    name: 'file',
    required: true,
    description: 'Upload image asset',
  })
  @Post(':id/assets')
  async createAsset(
    @Param('id') id: string,
    @Body('alias') alias: string,
    @UploadedFile() file: IUploadedFile,
  ) {
    return this.trialService.createAsset(id, file, alias);
  }

  @ApiOperation({ title: 'Update an asset to a trial' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiImplicitFile({
    name: 'file',
    required: true,
    description: 'Upload image asset',
  })
  @Put(':id/assets/:asset')
  async updateAsset(
    @Param('id') id: string,
    @Param('asset') assetId: string,
    @Body('alias') alias: string,
    @UploadedFile() file: IUploadedFile,
  ) {
    return this.trialService.updateAsset(id, assetId, file, alias);
  }

  @ApiOperation({ title: 'Get all trial assets' })
  @Get(':id/assets')
  async getAssets(@Param('id') id: string) {
    return await this.trialService.getAssets(id);
  }

  @ApiOperation({ title: 'Get a trial asset by ID' })
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

  @ApiOperation({ title: 'Delete a trial asset by ID' })
  @Delete(':id/assets/:asset')
  async removeAsset(@Param('id') id: string, @Param('asset') assetId: string) {
    this.trialService.removeAsset(id, assetId);
  }
}
