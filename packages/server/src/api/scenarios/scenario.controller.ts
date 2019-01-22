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
import { ScenarioOverview, IUploadedFile } from '../../models';
import { ScenarioService } from './scenario.service';

@ApiUseTags('scenarios')
@Controller('scenarios')
export class ScenarioController {
  constructor(
    @Inject('ScenarioService')
    private readonly scenarioService: ScenarioService,
  ) {}

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
  @ApiResponse({ status: 200, isArray: true, type: ScenarioOverview })
  @Get()
  findSome(@Query('skip') skip = 0, @Query('take') take = 25) {
    return this.scenarioService.findSome(skip, take);
  }

  @Post()
  async create(@Body() newScenario: ScenarioOverview) {
    return this.scenarioService.create(newScenario);
  }

  @ApiResponse({ status: 200, type: ScenarioOverview })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.scenarioService.findOne(id);
  }

  @ApiResponse({ status: 200, type: ScenarioOverview })
  @Put(':id')
  async update(@Param('id') id: string, @Body() scenario: ScenarioOverview) {
    return this.scenarioService.update(id, scenario);
  }

  @ApiOperation({ title: 'Delete a scenario by id' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      this.scenarioService.remove(id);
    } catch {}
  }

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
    @UploadedFile() file: IUploadedFile,
  ) {
    this.scenarioService.createAsset(id, file);
  }

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
    @UploadedFile() file: IUploadedFile,
  ) {
    this.scenarioService.updateAsset(id, assetId, file);
  }

  @ApiOperation({ title: 'Get all scenario assets' })
  @Get(':id/assets')
  async getAssets(@Param('id') id: string) {
    return await this.scenarioService.getAssets(id);
  }

  @Get(':id/assets/:asset')
  async getAsset(
    @Res() res: Response,
    @Param('id') id: string,
    @Param('asset') assetId: string,
  ) {
    const { data, mimetype, filename } = await this.scenarioService.getAsset(
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

  @Delete(':id/assets/:asset')
  async removeAsset(@Param('id') id: string, @Param('asset') assetId: string) {
    this.scenarioService.removeAsset(id, assetId);
  }
}
