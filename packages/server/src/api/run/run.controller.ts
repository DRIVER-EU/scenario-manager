import { ApiUseTags, ApiOperation, ApiImplicitBody } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Inject,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ISessionMessage } from 'trial-manager-models';
import { RunService } from './run.service';
import { SessionMessage } from '../../adapters/models';

@ApiUseTags('run')
@Controller('run')
export class RunController {
  private isLoading = false;

  constructor(@Inject('RunService') private readonly runService: RunService) {}

  @ApiOperation({ title: 'Get active trial scenario' })
  @Get('active')
  loaded() {
    if (this.isLoading) {
      throw new HttpException(
        'Currently loading a new scenario',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    const session = this.runService.activeSession;
    if (!session) {
      throw new HttpException(
        'No session is created',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return session;
  }

  @ApiOperation({ title: 'Deactivate trial scenario' })
  @Get('deactivate')
  async unload() {
    if (!this.runService.activeSession) {
      throw new HttpException(
        'No scenario is loaded, please activate one first',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    await this.runService.close();
  }

  @ApiOperation({ title: 'Load a trial scenario' })
  @ApiImplicitBody({
    name: 'Session message',
    type: SessionMessage,
  })
  @Post('activate')
  async load(@Body() session: ISessionMessage) {
    if (this.isLoading) {
      throw new HttpException(
        'Already loading a new scenario',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    this.isLoading = true;
    if (this.runService.activeSession) {
      throw new HttpException(
        'First deactivate current scenario',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    const ok = await this.runService.init(session);
    this.isLoading = false;
    if (!ok) {
      throw new HttpException(
        'Could not load trial or scenario',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
